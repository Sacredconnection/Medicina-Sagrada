import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { plainText } from "@/lib/html";
import type { WooCart } from "@/lib/cart-types";
import { CartInputError, type CartAction } from "@/lib/cart-validation";

const CART_COOKIE = "ms_cart";
export const privateHeaders = { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };

export class CommerceError extends Error {
  constructor(message: string, public status = 502) { super(message); }
}

export const readCartToken = async () => (await cookies()).get(CART_COOKIE)?.value;

export function setCartToken(response: NextResponse, token: string) {
  response.cookies.set(CART_COOKIE, token, {
    httpOnly: true, secure: new URL(config.siteUrl).protocol === "https:", sameSite: "lax", path: "/", maxAge: 60 * 60 * 48,
  });
}

export async function fetchCart(token?: string, path = "", body?: Record<string, unknown>): Promise<{ cart: WooCart; token: string }> {
  let response: Response;
  const url = new URL(`${config.wooStoreApiUrl}/cart${path}`);
  // The live LiteSpeed host was returning cache HITs even with no-store.
  // A unique non-secret query prevents one visitor receiving another cart token.
  if (!body) url.searchParams.set("_ms_cart", randomUUID());
  try {
    response = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: { Accept: "application/json", "Cache-Control": "no-store", ...(token ? { "Cart-Token": token } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store", signal: AbortSignal.timeout(15_000), redirect: "error",
    });
  } catch {
    throw new CommerceError(body ? "Não foi possível confirmar a alteração. Atualize a sacola antes de tentar novamente." : "Não foi possível consultar a sacola. Tente novamente em instantes.", 503);
  }
  if (/hit/i.test(response.headers.get("x-litespeed-cache") ?? "") || response.headers.get("cf-cache-status") === "HIT" || Number(response.headers.get("age") ?? 0) > 0) {
    throw new CommerceError("Não foi possível carregar sua sacola. Tente novamente em instantes.", 503);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const expired = response.status === 401 || response.status === 403;
    throw new CommerceError(expired ? "Atualize a sacola para continuar sua compra." : response.status >= 500 ? "A loja está temporariamente indisponível. Atualize a sacola antes de tentar novamente." : plainText(data?.message ?? "Não foi possível atualizar a sacola."), expired ? 401 : response.status >= 500 ? 502 : response.status);
  }
  const nextToken = response.headers.get("Cart-Token") ?? token;
  if (!nextToken || !data || !Array.isArray(data.items) || !data.totals) throw new CommerceError("Não foi possível carregar sua sacola. Tente novamente em instantes.");
  // Only return cart fields used by the storefront; exclude addresses and plugin data.
  return { token: nextToken, cart: {
    items: data.items, items_count: data.items_count, coupons: data.coupons, totals: data.totals,
    needs_shipping: data.needs_shipping, has_calculated_shipping: data.has_calculated_shipping,
    errors: data.errors ?? [], payment_methods: data.payment_methods ?? [],
  } };
}

export async function mutateCart(action: CartAction, token?: string) {
  if (action.action === "restore-item") {
    const current = await fetchCart(token);
    const existing = current.cart.items.find(item => item.id === action.id);
    // Retrying after a lost response must not add the removed quantity twice.
    if (existing && existing.quantity >= action.quantity) return current;
    return existing
      ? fetchCart(current.token, "/update-item", { key: existing.key, quantity: action.quantity })
      : fetchCart(current.token, "/add-item", { id: action.id, quantity: action.quantity, ...(action.variation ? { variation: action.variation } : {}) });
  }
  if (action.action === "add-bundle") {
    const original = await fetchCart(token);
    try {
      const result = await copyCart(original.cart, action.items);
      if (result.cart.errors.length || !sameItems(result.cart, original.cart, action.items)) throw new CommerceError("Disponibilidade alterada.", 409);
      return result;
    } catch {
      // Work only on a fresh session. The browser keeps its original cookie
      // unless the entire bundle is confirmed; retries cannot duplicate half.
      throw new CommerceError("Não foi possível adicionar o ritual completo. Sua sacola foi preservada. Confira os produtos e tente novamente.", 409);
    }
  }
  const sessionToken = token ?? (await fetchCart()).token;
  const { action: operation, ...body } = action;
  const paths = { add: "add-item", update: "update-item", remove: "remove-item", "apply-coupon": "apply-coupon", "remove-coupon": "remove-coupon" };
  return fetchCart(sessionToken, `/${paths[operation]}`, body);
}

type CartAddition = { id: number; quantity: number; variation?: WooCart["items"][number]["variation"] };
function sameItems(actual: WooCart, original: WooCart, additions: CartAddition[] = []) {
  const counts = (items: CartAddition[]) => {
    const result = new Map<number, number>();
    for (const item of items) result.set(item.id, (result.get(item.id) ?? 0) + item.quantity);
    return [...result].sort(([a], [b]) => a - b);
  };
  return JSON.stringify(counts(actual.items)) === JSON.stringify(counts([...original.items, ...additions]));
}

async function copyCart(cart: WooCart, additions: CartAddition[] = []) {
  const copy = await fetchCart();
  const requests = [
    ...[...cart.items, ...additions].map(item => ({
      method: "POST", path: "/wc/store/v1/cart/add-item",
      headers: { "Cart-Token": copy.token },
      body: { id: item.id, quantity: item.quantity, ...(item.variation?.length ? { variation: item.variation } : {}) },
    })),
    ...cart.coupons.map(coupon => ({ method: "POST", path: "/wc/store/v1/cart/apply-coupon", headers: { "Cart-Token": copy.token }, body: { code: coupon.code } })),
  ];
  // Woo's documented batch endpoint keeps sequential cart writes in one
  // upstream round trip. Never parallelize writes to the same Woo session.
  const signal = AbortSignal.timeout(30_000);
  for (let index = 0; index < requests.length; index += 20) {
    const chunk = requests.slice(index, index + 20);
    const response = await fetch(`${config.wooStoreApiUrl}/batch`, {
      method: "POST", headers: { "Content-Type": "application/json", "Cart-Token": copy.token },
      body: JSON.stringify({ requests: chunk }), cache: "no-store", redirect: "error", signal,
    });
    const data = await response.json();
    if (!response.ok || !Array.isArray(data.responses) || data.responses.length !== chunk.length ||
      data.responses.some((entry: { status?: number }) => !entry || typeof entry.status !== "number" || entry.status < 200 || entry.status >= 300)) {
      throw new CommerceError("Não foi possível confirmar todos os itens. Sua sacola foi preservada. Tente novamente.", 409);
    }
  }
  return fetchCart(copy.token);
}

export function cartResponse(result: { cart: WooCart; token: string }) {
  const response = NextResponse.json({ cart: result.cart }, { headers: privateHeaders });
  setCartToken(response, result.token);
  return response;
}

export function commerceError(error: unknown) {
  const status = error instanceof CartInputError ? 400 : error instanceof CommerceError ? error.status : 500;
  const response = NextResponse.json({ error: error instanceof CartInputError || error instanceof CommerceError ? error.message : "Não foi possível concluir. Tente novamente." }, { status, headers: privateHeaders });
  if (status === 401) response.cookies.delete(CART_COOKIE);
  return response;
}

export function checkoutUrl(token: string) {
  const url = new URL(config.wooCheckoutUrl);
  if (url.origin === new URL(config.siteUrl).origin) throw new CommerceError("Não foi possível abrir o pagamento. Tente novamente em instantes.", 503);
  url.searchParams.set("session", token);
  return url.toString();
}

// WooCommerce clones a guest session when opening ?session=. Reusing that same
// source after editing the cart would restore an old checkout. Each handoff gets
// a fresh source session, populated only from authoritative WooCommerce data.
export async function prepareCheckout(token: string) {
  const original = await fetchCart(token);
  if (!original.cart.items.length) throw new CommerceError("Sua sacola está vazia.", 400);
  if (original.cart.errors.length) throw new CommerceError(plainText(original.cart.errors[0].message), 409);
  if (!original.cart.payment_methods.some((method) => method.startsWith("woo-pagarme-payments-"))) throw new CommerceError("O pagamento está temporariamente indisponível. Tente novamente em instantes.", 503);
  // Check destination before doing any work.
  checkoutUrl(original.token);
  const copy = await copyCart(original.cart);
  if (copy.cart.errors.length || !sameItems(copy.cart, original.cart)) throw new CommerceError("A disponibilidade mudou. Confira os itens da sacola antes de continuar.", 409);
  // No address is collected in the frontend; shipping and payment discounts are
  // calculated by the existing checkout. Item totals must still agree.
  if (copy.cart.totals.total_items !== original.cart.totals.total_items || copy.cart.totals.total_discount !== original.cart.totals.total_discount) throw new CommerceError("O preço foi atualizado. Atualize a sacola e confira o novo total.", 409);
  return { ...copy, url: checkoutUrl(copy.token) };
}

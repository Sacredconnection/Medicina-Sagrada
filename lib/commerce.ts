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
    throw new CommerceError("A sessão de compra está temporariamente indisponível. Tente novamente em instantes.", 503);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const expired = response.status === 401 || response.status === 403;
    throw new CommerceError(expired ? "Sua sessão expirou. Atualize a sacola para continuar." : plainText(data?.message ?? "Não foi possível atualizar a sacola."), expired ? 401 : response.status >= 500 ? 502 : response.status);
  }
  const nextToken = response.headers.get("Cart-Token") ?? token;
  if (!nextToken || !data || !Array.isArray(data.items) || !data.totals) throw new CommerceError("A loja não retornou uma sessão de compra válida.");
  // Only return cart fields used by the storefront; exclude addresses and plugin data.
  return { token: nextToken, cart: {
    items: data.items, items_count: data.items_count, coupons: data.coupons, totals: data.totals,
    needs_shipping: data.needs_shipping, has_calculated_shipping: data.has_calculated_shipping,
    errors: data.errors ?? [], payment_methods: data.payment_methods ?? [],
  } };
}

export async function mutateCart(action: CartAction, token?: string) {
  const sessionToken = token ?? (await fetchCart()).token;
  const { action: operation, ...body } = action;
  const paths = { add: "add-item", update: "update-item", remove: "remove-item", "apply-coupon": "apply-coupon", "remove-coupon": "remove-coupon" };
  return fetchCart(sessionToken, `/${paths[operation]}`, body);
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
  if (url.origin === new URL(config.siteUrl).origin) throw new CommerceError("O checkout precisa usar a origem do WooCommerce. Confira a configuração do ambiente.", 503);
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
  let copy = await fetchCart();
  for (const item of original.cart.items) {
    copy = await fetchCart(copy.token, "/add-item", { id: item.id, quantity: item.quantity, ...(item.variation.length ? { variation: item.variation } : {}) });
  }
  for (const coupon of original.cart.coupons) copy = await fetchCart(copy.token, "/apply-coupon", { code: coupon.code });
  if (copy.cart.errors.length || copy.cart.items_count !== original.cart.items_count) throw new CommerceError("A disponibilidade mudou. Confira os itens da sacola antes de continuar.", 409);
  // No address is collected in the frontend; shipping and payment discounts are
  // calculated by the existing checkout. Item totals must still agree.
  if (copy.cart.totals.total_items !== original.cart.totals.total_items || copy.cart.totals.total_discount !== original.cart.totals.total_discount) throw new CommerceError("O preço foi atualizado. Atualize a sacola e confira o novo total.", 409);
  return { ...copy, url: checkoutUrl(copy.token) };
}

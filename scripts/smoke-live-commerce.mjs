import assert from "node:assert/strict";

// Explicit opt-in. Creates only temporary guest carts; never submits an order.
const [base, rawId, consent] = process.argv.slice(2);
if (!base || !/^\d+$/.test(rawId ?? "") || consent !== "--allow-live-cart") {
  throw new Error("Uso: node scripts/smoke-live-commerce.mjs URL_LOCAL ID_ARTESANATO --allow-live-cart");
}
const origin = new URL(base).origin;
const cookies = new Set();
let currentCookie = "";
async function local(path, body, cookie = currentCookie) {
  const response = await fetch(`${origin}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = response.headers.getSetCookie().find((value) => value.startsWith("ms_cart="));
  if (setCookie) { currentCookie = setCookie.split(";")[0]; cookies.add(currentCookie); }
  const data = await response.json();
  assert.equal(response.ok, true, data.error ?? "Falha na API local");
  return data;
}
let nativeCart;
let nativeToken;
let nativeBase;
try {
  await local("/api/cart/");
  const added = await local("/api/cart/", { action: "add", id: Number(rawId), quantity: 1 });
  assert.equal(added.cart.items_count, 1);
  const persisted = await local("/api/cart/");
  assert.equal(persisted.cart.items_count, 1);
  const checkout = await local("/api/checkout/", {});
  const target = new URL(checkout.url);
  assert.notEqual(target.origin, origin);
  const response = await fetch(target, { redirect: "manual" });
  assert.equal(response.status, 200, "O checkout não abriu diretamente com a sacola.");
  const html = await response.text();
  assert.ok(html.includes("woo-pagarme-payments"), "Pagar.me não encontrado no checkout.");
  assert.ok(html.includes("woocommerce-checkout"), "Formulário do checkout não encontrado.");
  const nativeCookies = response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  nativeBase = `${target.origin}/wp-json/wc/store/v1/cart`;
  const cartResponse = await fetch(`${nativeBase}?_ms_probe=${crypto.randomUUID()}`, { headers: { Cookie: nativeCookies } });
  nativeToken = cartResponse.headers.get("Cart-Token");
  nativeCart = await cartResponse.json();
  assert.equal(nativeCart.items_count, 1, "A sessão do checkout não recebeu os itens.");
  assert.equal(nativeCart.items[0].id, Number(rawId));
  assert.equal(nativeCart.items[0].quantity, 1);
  console.log(JSON.stringify({ checkout: response.status, sessionTransferred: true, productId: Number(rawId), quantity: 1, paymentMethods: nativeCart.payment_methods, orderCreated: false, charged: false }));
} finally {
  // Remove only items in the guest sessions created by this smoke test.
  for (const cookie of [...cookies]) {
    try {
      const result = await local("/api/cart/", undefined, cookie);
      for (const item of result.cart.items) await local("/api/cart/", { action: "remove", key: item.key }, cookie);
    } catch { console.error("Uma sacola temporária não pôde ser limpa; ela expirará no WooCommerce."); }
  }
  if (nativeToken && nativeCart?.items) {
    for (const item of nativeCart.items) {
      const cleanup = await fetch(`${nativeBase}/remove-item`, { method: "POST", headers: { "Cart-Token": nativeToken, "Content-Type": "application/json" }, body: JSON.stringify({ key: item.key }) });
      if (!cleanup.ok) console.error("A sacola temporária do checkout não pôde ser limpa.");
    }
  }
}

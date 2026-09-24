import { createServer } from "node:http";
import { createHash, randomUUID } from "node:crypto";

const sessions = new Map();
const currency = { currency_code: "BRL", currency_minor_unit: 2, currency_symbol: "R$", currency_decimal_separator: ",", currency_thousand_separator: ".", currency_prefix: "R$", currency_suffix: "" };
const prices = (amount) => ({ ...currency, price: String(amount), regular_price: String(amount), sale_price: String(amount), price_range: null });
const product = (id, name, slug, amount, extra = {}) => ({ id, name, slug, type: "simple", sku: String(id), permalink: `http://127.0.0.1:4010/product/${slug}/`, description: "<p>Artesanato em sementes.</p>", short_description: "<p>Feito à mão.</p>", prices: prices(amount), price_html: `<span>R$ ${(amount / 100).toFixed(2)}</span>`, images: [], categories: [], review_count: 0, average_rating: "0", on_sale: false, is_in_stock: true, is_purchasable: true, add_to_cart: { minimum: 1, maximum: 3, multiple_of: 1 }, ...extra });
const products = [
  product(100, "Colar de sementes", "colar-de-sementes", 5900),
  product(200, "Pulseira artesanal", "pulseira-artesanal", 3900, { type: "variable", variations: [{ id: 201, attributes: [{ name: "Tamanho", value: "P" }] }, { id: 202, attributes: [{ name: "Tamanho", value: "M" }] }] }),
  product(201, "Pulseira artesanal", "pulseira-artesanal-p", 3900, { type: "variation", variation: "P", permalink: "http://127.0.0.1:4010/product/pulseira-artesanal/" }),
  product(202, "Pulseira artesanal", "pulseira-artesanal-m", 4900, { type: "variation", variation: "M", is_in_stock: false }),
];
const keyFor = (id) => createHash("md5").update(String(id)).digest("hex");
function snapshot(session) {
  const items = session.items.map(({ id, quantity }) => {
    const p = products.find((item) => item.id === id);
    return { key: keyFor(id), id, quantity, name: p.name, permalink: p.permalink, images: [], prices: p.prices,
      variation: p.variation ? [{ attribute: "Tamanho", value: p.variation }] : [],
      quantity_limits: { minimum: 1, maximum: 3, multiple_of: 1, editable: true },
      totals: { ...currency, line_total: String(Number(p.prices.price) * quantity), line_subtotal: String(Number(p.prices.price) * quantity) } };
  });
  const total = items.reduce((sum, item) => sum + Number(item.totals.line_total), 0);
  const discount = session.coupons.length ? Math.min(1000, total) : 0;
  return { items, items_count: items.reduce((sum, item) => sum + item.quantity, 0), coupons: session.coupons.map((code) => ({ code, discount_type: "fixed_cart" })), totals: { ...currency, total_items: String(total), total_discount: String(discount), total_price: String(total - discount), total_shipping: null, total_tax: "0" }, needs_shipping: true, has_calculated_shipping: false, errors: [], payment_methods: ["woo-pagarme-payments-pix", "woo-pagarme-payments-credit_card", "woo-pagarme-payments-billet"] };
}
createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:4010");
  const send = (data, status = 200, headers = {}) => { res.writeHead(status, { "Content-Type": "application/json", ...headers }); res.end(JSON.stringify(data)); };
  if (url.pathname === "/health") return send({ ok: true });
  if (url.pathname === "/wp-admin/admin-ajax.php") {
    if (req.headers.cookie || req.headers.authorization || req.headers["cart-token"]) return send({ error: "Sessão não pode ser compartilhada com a cotação." }, 500);
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    const body = new URLSearchParams(Buffer.concat(chunks).toString());
    if (body.get("action") !== "cotation_product_page") return send({ error: "Ação incorreta" }, 400);
    const cep = body.get("data[cep_origem]");
    const id = Number(body.get("data[id_produto]"));
    const quantity = Number(body.get("data[quantity]"));
    if (cep === "99999000") return send({ success: false, error: "Error establishing a database connection" }, 500);
    if (cep === "20200000") await new Promise(resolve => setTimeout(resolve, 750));
    return send({ success: true, data: { quotations: cep === "01001000" ? [] : [
      { id: "pac", name: "Correios PAC (Melhor Envio)", price: `R$${quantity * 10},00`, delivery_time: "(5 a 8 dias úteis)" },
      { id: "sedex", name: id === 201 ? "Sedex — tamanho P" : "Correios Sedex", price: "R$35,16", delivery_time: null },
      { id: "free_shipping", name: "Frete grátis", price: "R$0,00", delivery_time: null, observations: "Somente em pedidos acima de R$300,00" },
    ] } }, 200, { "Set-Cookie": "wordpress_quote_only=test; Path=/" });
  }
  if (url.pathname === "/wp-json/ms-headless/v1/status") return send({ version: "1.0.0", cart_completion: true, revalidation: true });
  if (url.pathname === "/checkout/") {
    const session = sessions.get(url.searchParams.get("session"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(`<h1>Checkout de teste</h1><p>Nenhum pedido ou cobrança foi criado.</p>${session ? `<pre>${JSON.stringify(snapshot(session))}</pre>` : "Sacola vazia"}`);
  }
  if (url.pathname === "/wp-json/wc/store/v1/products") return send(products.filter((p) => p.type !== "variation" && (!url.searchParams.has("slug") || p.slug === url.searchParams.get("slug"))));
  const productId = url.pathname.match(/^\/wp-json\/wc\/store\/v1\/products\/(\d+)$/);
  if (productId) return send(products.find((p) => p.id === Number(productId[1])) ?? {}, products.some((p) => p.id === Number(productId[1])) ? 200 : 404);
  if (url.pathname.startsWith("/wp-json/wc/store/v1/cart")) {
    // Reproduce the live host's broken cache: unbusted GETs share an empty cart.
    if (req.method === "GET" && !url.searchParams.has("_ms_cart")) return send(snapshot({ items: [], coupons: [] }), 200, { "Cart-Token": "shared-cached-token", "X-LiteSpeed-Cache": "hit" });
    const token = req.headers["cart-token"] ?? randomUUID();
    if (req.headers["cart-token"] && !sessions.has(token)) return send({ message: "Sessão expirada" }, 401);
    if (!sessions.has(token)) sessions.set(token, { items: [], coupons: [] });
    const session = sessions.get(token);
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
    const action = url.pathname.split("/").at(-1);
    const fail = (message, status = 400) => send({ message }, status, { "Cart-Token": token });
    if (action === "add-item") {
      const p = products.find((p) => p.id === body.id);
      if (!p?.is_in_stock || p.type === "variable") return fail("Produto indisponível.");
      const item = session.items.find((item) => item.id === body.id);
      if (body.quantity + (item?.quantity ?? 0) > 3) return fail("Estoque insuficiente.", 409);
      if (item) item.quantity += body.quantity; else session.items.push({ id: body.id, quantity: body.quantity });
    }
    if (action === "update-item") {
      const item = session.items.find((item) => keyFor(item.id) === body.key);
      if (!item || body.quantity > 3 || body.quantity < 1) return fail("Quantidade indisponível.", 409);
      item.quantity = body.quantity;
    }
    if (action === "remove-item") session.items = session.items.filter((item) => keyFor(item.id) !== body.key);
    if (action === "apply-coupon") { if (body.code !== "PROMO10") return fail("Cupom inválido."); session.coupons = [body.code]; }
    if (action === "remove-coupon") session.coupons = [];
    return send(snapshot(session), 200, { "Cart-Token": token });
  }
  if (url.pathname.startsWith("/wp-json/")) return send([]);
  send({ error: "Not found" }, 404);
}).listen(4010, "127.0.0.1", () => console.log("WooCommerce de teste disponível na porta 4010."));

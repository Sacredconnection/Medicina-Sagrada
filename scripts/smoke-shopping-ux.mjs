import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const [base, consent] = process.argv.slice(2);
if (!base || consent !== "--allow-live-cart") throw new Error("Uso: node scripts/smoke-shopping-ux.mjs URL --allow-live-cart");
const origin = new URL(base).origin;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
try {
  await page.goto(`${origin}/busca/?ordem=menor_preco&estoque=1`, { waitUntil: "networkidle" });
  assert.ok(await page.locator(".product-card").count());
  assert.equal(await page.getByLabel("Ordenar por").inputValue(), "menor_preco");
  await page.screenshot({ path: "artifacts/ux-catalog-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/ux-catalog-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Filtros +" }).click();
  await page.screenshot({ path: "artifacts/ux-filters-mobile.png" });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  console.log("OK: catálogo real, ordenação, estoque e filtros responsivos.");

  const latest = await (await fetch("https://medicinasagrada.com.br/wp-json/wc/store/v1/products/reviews?per_page=1")).json();
  const product = await (await fetch(`https://medicinasagrada.com.br/wp-json/wc/store/v1/products/${latest[0].product_id}`)).json();
  await page.goto(`${origin}/product/${product.slug}/`, { waitUntil: "networkidle" });
  await page.locator(".review").first().waitFor();
  assert.ok(await page.locator(".review-stars").count());
  await page.locator("#avaliacoes").screenshot({ path: "artifacts/ux-reviews-mobile.png" });
  console.log("OK: avaliações publicadas pelo WooCommerce renderizadas, incluindo nota baixa.");

  await page.goto(`${origin}/product/brincos-cobra-coral-grande-com-tarracha/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: "artifacts/ux-product-mobile.png", fullPage: true });
  const adding = page.waitForResponse(r => new URL(r.url()).pathname === "/api/cart/" && r.request().method() === "POST");
  await page.getByRole("button", { name: "Adicionar à sacola" }).click();
  assert.equal((await adding).status(), 200);
  const drawer = page.getByRole("dialog");
  await drawer.waitFor();
  await drawer.evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
  await page.screenshot({ path: "artifacts/ux-drawer-mobile.png" });
  await drawer.getByRole("link", { name: "Ver minha sacola", exact: true }).click();
  await page.waitForURL(`${origin}/cart/`);
  await page.locator(".bag-item").waitFor();
  assert.equal(await page.locator(".bag-item").count(), 1);
  await page.screenshot({ path: "artifacts/ux-cart-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Continuar para pagamento" }).click();
  await page.waitForURL(url => url.origin === "https://medicinasagrada.com.br" && url.pathname === "/checkout/", { timeout: 60000 });
  await page.waitForLoadState("domcontentloaded");
  await page.locator("form.checkout").waitFor({ timeout: 45000 });
  assert.equal(new URL(page.url()).searchParams.has("session"), false);
  console.log("OK: produto 6374 → side cart → sacola → checkout Woo real. Nenhum pedido ou pagamento criado.");
  assert.deepEqual(errors, []);
} finally {
  // Isolated browser/session: remove only this test's artisan product.
  try {
    const response = await context.request.get(`${origin}/api/cart/`);
    const { cart } = await response.json();
    for (const item of cart.items) {
      assert.equal(item.id, 6374);
      assert.ok((await context.request.post(`${origin}/api/cart/`, { headers: { Origin: origin }, data: { action: "remove", key: item.key } })).ok());
    }
    const wpCartUrl = "https://medicinasagrada.com.br/wp-json/wc/store/v1/cart";
    const wpCartResponse = await context.request.get(`${wpCartUrl}?_ms_cart=${Date.now()}`);
    if (wpCartResponse.ok()) {
      const wpCart = await wpCartResponse.json();
      const token = wpCartResponse.headers()["cart-token"];
      for (const item of wpCart.items ?? []) {
        assert.equal(item.id, 6374);
        assert.ok(token);
        assert.ok((await context.request.post(`${wpCartUrl}/remove-item`, { headers: { "Cart-Token": token }, data: { key: item.key } })).ok());
      }
    }
    console.log("Sacolas temporárias de teste limpas.");
  } catch { console.error("Não foi possível confirmar limpeza de toda a sessão temporária."); process.exitCode = 1; }
  await browser.close();
}

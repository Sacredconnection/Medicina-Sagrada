import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const [base, consent] = process.argv.slice(2);
if (!base || consent !== "--allow-live-quote") throw new Error("Uso: node scripts/smoke-live-shipping.mjs URL --allow-live-quote");
const origin = new URL(base).origin;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
try {
  await page.goto(`${origin}/product/brincos-cobra-coral-grande-com-tarracha/`, { waitUntil: "domcontentloaded" });
  const adding = page.waitForResponse(response => new URL(response.url()).pathname === "/api/cart/" && response.request().method() === "POST");
  await page.getByRole("button", { name: "Adicionar à sacola" }).click();
  const added = await adding;
  const addedData = await added.json();
  assert.equal(added.status(), 200, addedData.error);
  await page.getByRole("status").filter({ hasText: "Produto adicionado" }).waitFor();
  const beforeResponse = await context.request.get(`${origin}/api/cart/`);
  assert.ok(beforeResponse.ok());
  const before = (await beforeResponse.json()).cart;
  assert.equal(before.items_count, 1);
  assert.equal(before.items[0].id, 6374);
  const cookieBefore = (await context.cookies()).find(cookie => cookie.name === "ms_cart")?.value;
  await page.getByLabel("CEP de entrega").fill("01310100");
  const maximum = Number(await page.getByLabel("Quantidade", { exact: true }).getAttribute("max")) || 1;
  for (const quantity of [...new Set([1, Math.min(2, maximum)])]) {
    await page.getByLabel("Quantidade", { exact: true }).fill(String(quantity));
    const pending = page.waitForResponse(response => new URL(response.url()).pathname === "/api/shipping/", { timeout: 45000 });
    await page.getByRole("button", { name: "Calcular", exact: true }).click();
    const response = await pending;
    const data = await response.json();
    assert.equal(response.status(), 200, data.error);
    assert.ok(data.quotes.length > 0, "Nenhuma cotação real retornada.");
    assert.equal(response.headers()["set-cookie"], undefined);
    await page.locator(".shipping-results").waitFor();
    console.log(JSON.stringify({ quantity, status: response.status(), quotes: data.quotes }));
  }
  await page.locator(".shipping-calculator").screenshot({ path: "artifacts/shipping-live-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".shipping-calculator").screenshot({ path: "artifacts/shipping-live-mobile.png" });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  const cookieAfter = (await context.cookies()).find(cookie => cookie.name === "ms_cart")?.value;
  assert.equal(cookieAfter, cookieBefore);
  const after = (await (await context.request.get(`${origin}/api/cart/`)).json()).cart;
  assert.deepEqual(after, before, "Cotação alterou a sacola.");
  console.log("OK: cotação real no navegador; sacola e cookie preservados; nenhum pedido ou etiqueta criado.");
} finally {
  try {
    const response = await context.request.get(`${origin}/api/cart/`);
    if (!response.ok()) throw new Error();
    const { cart } = await response.json();
    for (const item of cart.items) {
      assert.equal(item.id, 6374);
      const removed = await context.request.post(`${origin}/api/cart/`, { headers: { Origin: origin }, data: { action: "remove", key: item.key } });
      assert.ok(removed.ok());
    }
    console.log("Itens da sessão de teste removidos.");
  } catch { console.error("Não foi possível confirmar a limpeza da sessão temporária; ela expirará no WooCommerce."); process.exitCode = 1; }
  await browser.close();
}

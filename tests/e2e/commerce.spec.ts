import { expect, test } from "@playwright/test";

test("sacola persiste, edita quantidades, trata cupons e transfere valores ao checkout", async ({ page }) => {
  await page.goto("/product/colar-de-sementes/");
  await page.getByRole("button", { name: "Adicionar à sacola" }).click();
  await expect(page.getByRole("status")).toContainText("Produto adicionado");
  await page.getByRole("link", { name: "Ver minha sacola" }).click();
  await expect(page).toHaveURL(/\/cart\/$/);
  await expect(page.getByRole("heading", { name: "Colar de sementes" })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Aumentar quantidade de Colar de sementes" }).click();
  await expect(page.locator(".bag-item-price")).toContainText("118,00");
  await page.getByLabel("Tem um cupom?").fill("INVALIDO");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Cupom inválido" })).toBeVisible();
  await page.getByLabel("Tem um cupom?").fill("PROMO10");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(page.locator(".bag-subtotal")).toContainText("108,00");
  await page.screenshot({ path: "test-results/sacola-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/sacola-mobile.png", fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Continuar para pagamento" }).click();
  await expect(page).toHaveURL(/127\.0\.0\.1:4010\/checkout\/\?session=/);
  await expect(page.locator("pre")).toContainText('"total_price":"10800"');
  await expect(page.locator("pre")).toContainText('"quantity":2');
  // Return, change the bag and transfer again: must create a new source session.
  const firstCheckout = page.url();
  await page.goto("http://127.0.0.1:3017/cart/");
  await page.getByRole("button", { name: "Diminuir quantidade de Colar de sementes" }).click();
  await expect(page.locator(".bag-item-price")).toContainText("59,00");
  await page.getByRole("button", { name: "Continuar para pagamento" }).click();
  await expect(page).toHaveURL(/127\.0\.0\.1:4010\/checkout\/\?session=/);
  expect(page.url()).not.toBe(firstCheckout);
  await expect(page.locator("pre")).toContainText('"quantity":1');
});

test("variações, remoção e sacola vazia", async ({ page }) => {
  await page.goto("/product/pulseira-artesanal/");
  await expect(page.getByRole("button", { name: "Adicionar à sacola" })).toBeDisabled();
  await expect(page.getByRole("option", { name: /M — Esgotado/ })).toHaveJSProperty("disabled", true);
  await page.getByLabel("Escolha uma opção").selectOption("201");
  await page.getByRole("button", { name: "Adicionar à sacola" }).click();
  await page.getByRole("link", { name: "Ver minha sacola" }).click();
  await expect(page.getByText("Tamanho: P")).toBeVisible();
  await page.getByRole("button", { name: "Remover Pulseira artesanal", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sua sacola está vazia" })).toBeVisible();
});

test("API recusa CSRF e adulteração; sessões são isoladas; cookies são privados", async ({ request, playwright }) => {
  const cart = await request.get("/api/cart/");
  expect(cart.headers()["set-cookie"]).toContain("HttpOnly");
  expect(cart.headers()["set-cookie"]).toContain("SameSite=lax");
  expect(cart.headers()["cache-control"]).toContain("no-store");
  const badOrigin = await request.post("/api/cart/", { headers: { Origin: "https://evil.example" }, data: { action: "add", id: 100, quantity: 1 } });
  expect(badOrigin.status()).toBe(403);
  const added = await request.post("/api/cart/", { headers: { Origin: "http://127.0.0.1:3017" }, data: { action: "add", id: 100, quantity: 1, price: 1 } });
  expect((await added.json()).cart.totals.total_price).toBe("5900");
  const invalid = await request.post("/api/cart/", { headers: { Origin: "http://127.0.0.1:3017" }, data: { action: "add", id: 100, quantity: -1 } });
  expect(invalid.status()).toBe(400);
  const other = await playwright.request.newContext({ baseURL: "http://127.0.0.1:3017" });
  expect((await (await other.get("/api/cart/")).json()).cart.items_count).toBe(0);
  await other.dispose();
});

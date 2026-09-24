import { expect, test } from "@playwright/test";

test("calcula com quantidade e mantém a sacola intacta, sem propagar cookies", async ({ page }) => {
  await page.goto("/product/colar-de-sementes/");
  await page.getByRole("button", { name: "Adicionar à sacola" }).click();
  await expect(page.getByRole("status")).toContainText("Produto adicionado");
  const before = await (await page.request.get("/api/cart/")).json();
  await page.getByLabel("CEP de entrega").fill("01310100");
  const quoted = page.waitForResponse(r => r.url().includes("/api/shipping/"));
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  const response = await quoted;
  expect(response.status()).toBe(200);
  expect(response.headers()["set-cookie"]).toBeUndefined();
  await expect(page.locator(".shipping-results")).toContainText("R$10,00");
  await expect(page.locator(".shipping-results")).toContainText("5 a 8 dias úteis");
  await expect(page.locator(".shipping-results")).toContainText("Somente em pedidos acima de R$300,00");
  await page.getByLabel("Quantidade", { exact: true }).fill("2");
  await expect(page.locator(".shipping-results")).toHaveCount(0);
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(page.locator(".shipping-results")).toContainText("R$20,00");
  expect((await (await page.request.get("/api/cart/")).json()).cart).toEqual(before.cart);
  await page.screenshot({ path: "test-results/shipping-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/shipping-mobile.png", fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("respeita variação, CEP inválido, indisponibilidade e resultados antigos", async ({ page }) => {
  await page.goto("/product/pulseira-artesanal/");
  await expect(page.getByRole("button", { name: "Calcular", exact: true })).toBeDisabled();
  await page.getByLabel("Escolha uma opção").selectOption("201");
  await page.getByLabel("CEP de entrega").fill("123");
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(page.locator(".shipping-calculator [role=alert]")).toContainText("8 números");
  await page.getByLabel("CEP de entrega").fill("01310100");
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(page.locator(".shipping-results")).toContainText("Sedex — tamanho P");
  await page.getByLabel("CEP de entrega").fill("99999000");
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(page.locator(".shipping-calculator [role=alert]")).toContainText("Não foi possível consultar o frete agora");
  await expect(page.locator(".shipping-calculator [role=alert]")).not.toContainText("database");
  await page.getByLabel("CEP de entrega").fill("01001000");
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(page.getByText(/Nenhuma opção retornada/)).toBeVisible();
  await page.getByLabel("CEP de entrega").fill("20200000");
  const pending = page.waitForResponse(r => r.url().includes("/api/shipping/"));
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await page.getByLabel("Quantidade", { exact: true }).fill("2");
  await pending;
  await expect(page.locator(".shipping-results")).toHaveCount(0);
});

test("API restringe origem, produto e quantidade", async ({ request }) => {
  const headers = { Origin: "http://127.0.0.1:3017" };
  const data = { productId: 100, quantity: 1, postcode: "01310100" };
  expect((await request.post("/api/shipping/", { headers: { Origin: "https://evil.example" }, data })).status()).toBe(403);
  for (const override of [{ productId: 200 }, { productId: 202 }, { quantity: 4 }, { quantity: -1 }, { postcode: "00000000" }]) {
    expect((await request.post("/api/shipping/", { headers, data: { ...data, ...override } })).status()).toBe(422);
  }
  expect((await request.post("/api/shipping/", { headers, data: { ...data, productId: 999 } })).status()).toBe(404);
});

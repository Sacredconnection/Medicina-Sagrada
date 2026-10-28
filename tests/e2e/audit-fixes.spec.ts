import { expect, test } from "@playwright/test";

test("ritual falho preserva sacola e tentativa posterior não duplica itens", async ({ request }) => {
  const headers = { Origin: "http://127.0.0.1:3017" };
  await request.get("/api/cart/");
  await request.post("/api/cart/", { headers, data: { action: "add", id: 100, quantity: 1 } });
  const failed = await request.post("/api/cart/", { headers, data: { action: "add-bundle", items: [{ id: 201, quantity: 1 }, { id: 202, quantity: 1 }] } });
  expect(failed.status()).toBe(409);
  expect((await failed.json()).error).toContain("preservada");
  const original = (await (await request.get("/api/cart/")).json()).cart;
  expect(original.items.map((item: { id: number }) => item.id)).toEqual([100]);
  const success = await request.post("/api/cart/", { headers, data: { action: "add-bundle", items: [{ id: 201, quantity: 1 }, { id: 301, quantity: 1 }] } });
  expect(success.status()).toBe(200);
  expect((await success.json()).cart.items_count).toBe(3);
});

test("desfazer restaura a quantidade removida da sacola", async ({ page }) => {
  await page.goto("/product/colar-de-sementes/");
  await page.getByRole("button", { name: "Adicionar à sacola", exact: true }).click();
  const drawer = page.getByRole("dialog");
  await drawer.getByRole("button", { name: "Remover Colar de sementes", exact: true }).click();
  await expect(drawer).toContainText("foi removido");
  await drawer.getByRole("button", { name: "Desfazer remoção" }).click();
  await expect(drawer.locator(".cart-drawer-item")).toHaveCount(1);
  await expect(drawer.locator(".cart-undo")).toHaveCount(0);
});

test("repetir restauração após perda de resposta não duplica quantidade", async ({ request }) => {
  const options = { headers: { Origin: "http://127.0.0.1:3017" }, data: { action: "restore-item", id: 100, quantity: 2 } };
  expect((await request.post("/api/cart/", options)).status()).toBe(200);
  const repeated = await request.post("/api/cart/", options);
  expect(repeated.status()).toBe(200);
  expect((await repeated.json()).cart.items_count).toBe(2);
});

test("newsletter sem configuração retorna indisponibilidade explícita, sem falso cadastro", async ({ request }) => {
  const response = await request.post("/api/newsletter/", { headers: { Origin: "http://127.0.0.1:3017" }, data: { email: "teste@example.com", consent: true } });
  expect(response.status()).toBe(503);
  expect(response.headers()["content-type"]).toContain("application/json");
  expect((await response.json()).error).toBeTruthy();
});

test("newsletter rejeita origem externa e cadastro sem consentimento", async ({ request }) => {
  const foreign = await request.post("/api/newsletter/", { headers: { Origin: "https://example.com" }, data: { email: "teste@example.com", consent: true } });
  expect(foreign.status()).toBe(403);
  const noConsent = await request.post("/api/newsletter/", { headers: { Origin: "http://127.0.0.1:3017" }, data: { email: "teste@example.com", consent: false } });
  expect(noConsent.status()).toBe(400);
});

test("páginas de intenção têm um único marco principal e recebem CSP", async ({ page }) => {
  const response = await page.goto("/intencoes/");
  await expect(page.locator("main")).toHaveCount(1);
  expect(response?.headers()["content-security-policy"]).toContain("script-src-attr 'none'");
  expect(response?.headers()["reporting-endpoints"]).toContain("/api/csp-report/");
});

test("coletor CSP valida formato e limita tamanho do corpo", async ({ request }) => {
  const response = await request.post("/api/csp-report/", { headers: { "Content-Type": "application/csp-report" }, data: JSON.stringify({ "csp-report": { "document-uri": "http://127.0.0.1:3017/", "effective-directive": "script-src", "blocked-uri": "inline" } }) });
  expect(response.status()).toBe(204);
  const oversized = await request.post("/api/csp-report/", { headers: { "Content-Type": "application/csp-report" }, data: "x".repeat(17000) });
  expect(oversized.status()).toBe(413);
});

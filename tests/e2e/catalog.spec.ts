import { expect, test } from "@playwright/test";

test("catálogo filtra, ordena e preserva a consulta na paginação", async ({ page }) => {
  await page.goto("/busca/?q=Artesanato&ordem=menor_preco");
  await expect(page.getByRole("button", { name: "Filtros +" })).not.toBeVisible();
  await expect(page.locator(".product-card")).toHaveCount(12);
  await expect(page.getByRole("link", { name: "Próxima página" })).toHaveCount(0);
  await expect(page.locator(".product-card h2").first()).toHaveText("Artesanato 1");
  await page.getByLabel("Ordenar por").selectOption("maior_preco");
  await expect(page.locator(".product-card h2").first()).toHaveText("Artesanato 12");
  await page.getByLabel("Mínimo", { exact: true }).fill("30");
  await page.getByLabel("Máximo", { exact: true }).fill("60");
  await page.getByLabel("Em oferta", { exact: true }).check();
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
  await expect(page.locator(".product-card h2").first()).toHaveText("Artesanato 5");
  await page.goto("/busca/?estoque=1&ordem=menor_preco");
  await page.getByRole("link", { name: "Próxima página" }).click();
  await expect(page).toHaveURL(/estoque=1/);
  await expect(page).toHaveURL(/pagina=2/);
  await expect(page.locator(".product-card")).toHaveCount(1);
});

test("falha ao carregar mais avaliações oferece nova tentativa sem duplicar", async ({ page }) => {
  await page.goto("/product/colar-de-sementes/");
  await page.route("**/api/reviews/**", route => route.fulfill({ status: 503, json: { error: "indisponível" } }));
  await page.getByRole("button", { name: "Carregar mais avaliações" }).click();
  await expect(page.locator("#avaliacoes [role=alert]")).toContainText("Tente novamente");
  await expect(page.locator(".review")).toHaveCount(5);
  await page.unroute("**/api/reviews/**");
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page.locator(".review")).toHaveCount(7);
});

test("API de avaliações valida parâmetros e não permite enviar como administrador", async ({ request }) => {
  expect((await request.get("/api/reviews/?product=-1")).status()).toBe(400);
  expect((await request.post("/api/reviews/", { data: { product: 100, rating: 5 } })).status()).toBe(405);
  const response = await request.get("/api/reviews/?product=100");
  expect(response.status()).toBe(200);
  expect(response.headers()["set-cookie"]).toBeUndefined();
  const result = await response.json();
  expect(Object.keys(result.data[0]).sort()).toEqual(["date", "id", "rating", "review", "reviewer", "verified"]);
});

test("categoria usa URL canônica, filtros no celular e estado vazio recuperável", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/product-category/artesanato/colares/");
  await expect(page.getByRole("button", { name: "Aplicar filtros" })).not.toBeVisible();
  await page.getByRole("button", { name: "Filtros +" }).click();
  await page.getByLabel("Mínimo", { exact: true }).fill("999");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.getByRole("heading", { name: "Nenhum produto encontrado" })).toBeVisible();
  await page.getByRole("link", { name: "Recomeçar a busca" }).click();
  await expect(page.locator(".product-card")).toHaveCount(12);
  await page.screenshot({ path: "test-results/catalog-mobile.png", fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("produto mostra galeria, avaliações reais da API e acesso ao envio autenticado", async ({ page }) => {
  await page.goto("/product/colar-de-sementes/");
  await expect(page.locator(".breadcrumbs").getByRole("link", { name: "Colares" })).toHaveAttribute("href", "/product-category/artesanato/colares/");
  await page.getByRole("button", { name: "Ver imagem 2 de Colar de sementes" }).click();
  await expect(page.getByRole("button", { name: "Ver imagem 2 de Colar de sementes" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".review")).toHaveCount(5);
  await expect(page.locator(".review-stars").first()).toHaveAttribute("aria-label", "1 de 5 estrelas");
  await expect(page.locator(".review").first()).not.toContainText("Compra verificada");
  await expect(page.locator(".review").first()).not.toContainText("alert(");
  await page.getByRole("button", { name: "Carregar mais avaliações" }).click();
  await expect(page.locator(".review")).toHaveCount(7);
  await expect(page.getByRole("link", { name: "Escrever uma avaliação" })).toHaveAttribute("href", "http://127.0.0.1:4010/product/colar-de-sementes/#review_form");
});

test("variação muda preço e quantidade pode ser editada no side cart", async ({ page }) => {
  await page.goto("/product/pulseira-artesanal/");
  await expect(page.getByText("Selecione uma opção para ver o preço exato.")).toBeVisible();
  await page.getByLabel("Escolha uma opção").selectOption("201");
  await expect(page.locator(".purchase-price")).toContainText("39.00");
  await page.getByRole("button", { name: "Adicionar à sacola" }).click();
  const drawer = page.getByRole("dialog");
  await drawer.getByRole("button", { name: "Aumentar quantidade de Pulseira artesanal" }).click();
  await expect(drawer).toContainText("Quantidade: 2");
  await expect(drawer).toContainText("78,00");
});

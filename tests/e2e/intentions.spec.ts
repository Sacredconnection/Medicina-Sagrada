import { expect, test } from "@playwright/test";

test("intenção inclui principais e secundárias, preserva paginação e aparece no produto", async ({ page }) => {
  await page.goto("/busca/");
  await page.getByLabel("Buscar por intenção").selectOption("foco-e-clareza");
  await expect(page).toHaveURL(/intencao=foco-e-clareza/);
  await expect(page.locator(".catalog-toolbar")).toContainText("13 produtos encontrados");
  await expect(page.locator(".product-card")).toHaveCount(12);
  await page.getByRole("link", { name: "Próxima página" }).click();
  await expect(page).toHaveURL(/intencao=foco-e-clareza/);
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("link", { name: "Página anterior" }).click();
  await page.locator('.product-card a[href="/product/colar-de-sementes/"]').click();
  await expect(page.locator(".product-intention-panel")).toContainText("Foco e clareza");
  await expect(page.locator(".product-intention-panel")).toContainText("Coração e conexão");
  await page.locator(".product-intention-panel").getByRole("link", { name: "Coração e conexão" }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-card-intentions")).toContainText("Coração e conexão");
  const sidebar = page.getByRole("navigation", { name: "Escolher intenção", exact: true });
  await expect(sidebar.getByRole("link", { name: "Coração e conexão", exact: true })).toHaveAttribute("aria-current", "page");
  await sidebar.getByRole("link", { name: "Foco e clareza", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Foco e clareza");
  await expect(page.locator(".product-card")).toHaveCount(13);
  await expect(sidebar.getByRole("link", { name: "Foco e clareza", exact: true })).toHaveAttribute("aria-current", "page");
  await page.screenshot({ path: "test-results/intention-sidebar-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(sidebar).toBeHidden();
  await page.locator(".intention-sidebar-mobile summary").click();
  await expect(sidebar.getByRole("link")).toHaveCount(9);
  await page.screenshot({ path: "test-results/intention-sidebar-mobile-open.png" });
  await sidebar.getByRole("link", { name: "Coração e conexão", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Coração e conexão");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".intention-sidebar-mobile")).not.toHaveAttribute("open", "");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/intention-mobile.png", fullPage: true });
});

test("índice reúne oito intenções e conecta Força e coragem à jornada compartilhada", async ({ page }) => {
  await page.goto("/intencoes/");
  await expect(page.locator(".intention-card")).toHaveCount(8);
  await page.locator('.intention-card[href="/intencoes/forca-e-coragem/"]').click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Força e coragem");
  await page.goto("/intencoes/");
  const matcher = page.locator("#descubra-seu-rape");
  const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
  const indexTitles = (await page.locator(".intentions-list .intention-card-title").allTextContents()).map(normalize);
  const indexDescriptions = (await page.locator(".intentions-list .intention-card-meaning").allTextContents()).map(normalize);
  await matcher.getByRole("button", { name: "Iniciar Jornada" }).click();
  await expect(matcher.locator(".matcher-card-title")).toHaveCount(8);
  expect((await matcher.locator(".matcher-card-title").allTextContents()).map(normalize)).toEqual(indexTitles);
  expect((await matcher.locator(".matcher-card-description").allTextContents()).map(normalize)).toEqual(indexDescriptions);
  await matcher.getByRole("button", { name: /Força e\s+coragem/i }).click();
  await matcher.getByRole("button", { name: /Iniciante/ }).click();
  await expect(matcher.getByRole("link", { name: "Conheça esta intenção e seus produtos" })).toHaveAttribute("href", "/intencoes/forca-e-coragem/");
  await page.goto("/busca/");
  await page.getByLabel("Buscar por intenção").selectOption("forca-e-coragem");
  await expect(page).toHaveURL(/intencao=forca-e-coragem/);
});

test("home e índice oferecem oito escolhas com acesso às três novas intenções", async ({ page }) => {
  for (const [route, width] of [["/", 1440], ["/intencoes/", 390]] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    const matcher = page.locator("#descubra-seu-rape");
    await expect(matcher.locator(".matcher-intro-intention-slot")).toHaveCount(8);
    await matcher.getByRole("button", { name: "Iniciar Jornada" }).click();
    await expect(matcher.locator(".matcher-intention-card")).toHaveCount(8);
    for (const slug of ["foco-e-clareza", "energia-e-renovacao", "oracao-e-cerimonia"]) {
      await expect(matcher.locator(`a.matcher-intention-card[href="/intencoes/${slug}/"]`)).toHaveCount(1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await matcher.locator('a[href="/intencoes/oracao-e-cerimonia/"]').click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Oração e cerimônia");
  }
});

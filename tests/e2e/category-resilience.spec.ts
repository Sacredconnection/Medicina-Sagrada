import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`catálogo continua disponível quando o conteúdo editorial retorna 404 (${width})`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 844 });
    // The public Store API works, but this legacy HTML archive is unavailable.
    expect((await request.get("http://127.0.0.1:4010/product-category/artesanato/")).status()).toBe(404);
    const response = await page.goto("/product-category/artesanato/");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Artesanato", exact: true, level: 1 })).toBeVisible();
    await expect(page.locator(".product-card")).toHaveCount(12);
    await expect(page.locator(".catalog-toolbar")).toContainText("14 produtos encontrados");
    await expect(page.locator(".category-editorial")).toHaveCount(0);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/category-editorial-unavailable-${width}.png`, fullPage: true });
    await page.getByRole("link", { name: "Próxima página" }).click();
    await expect(page).toHaveURL(/\/page\/2\//);
    await expect(page.locator(".product-card")).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test(`conteúdo editorial continua aparecendo quando o WordPress responde (${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const response = await page.goto("/product-category/artesanato/colares/");
    expect(response?.status()).toBe(200);
    await expect(page.locator(".product-card")).toHaveCount(12);
    await expect(page.locator(".category-editorial")).toContainText("Conteúdo editorial da categoria preservado.");
    await expect(page.locator(".category-editorial h2")).toHaveText("Origem dos colares de teste");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/category-editorial-available-${width}.png`, fullPage: true });
  });
}

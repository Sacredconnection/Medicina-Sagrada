import { expect, test } from "@playwright/test";

test("produtos aparecem enquanto o HTML editorial ainda está pendente", async ({ page, request }) => {
  // Compile the route first so development compilation doesn't affect the check.
  await page.goto("/product-category/artesanato/");
  await expect(page.locator(".catalog-results .product-card")).toHaveCount(12);
  await request.post("http://127.0.0.1:4010/__test/editorial-delay?ms=5000");
  try {
    await page.goto("/product-category/artesanato/", { waitUntil: "commit" });
    await expect(page.locator(".catalog-results .product-card")).toHaveCount(12);
    const status = await (await request.get("http://127.0.0.1:4010/health")).json();
    expect(status.pendingEditorialRequests).toBeGreaterThan(0);
    await page.waitForLoadState("load");
    await expect(page.locator(".category-editorial")).toHaveCount(0);
  } finally {
    await request.post("http://127.0.0.1:4010/__test/editorial-delay?ms=0");
  }
});

for (const width of [1280, 390]) {
  test(`links de páginas abrem no topo e filtros mantêm a posição (${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/product-category/artesanato/");
    await page.getByRole("link", { name: "Próxima página" }).click();
    await expect(page).toHaveURL(/\/page\/2\//);
    await expect(page.locator(".catalog-results .product-card")).toHaveCount(2);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    await page.locator("footer a[href='/product-category/artesanato/']").click();
    await expect(page).toHaveURL(/\/product-category\/artesanato\/$/);
    await expect(page.locator(".catalog-results .product-card")).toHaveCount(12);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    await page.locator(".catalog-results .product-card-link").first().click();
    await expect(page).toHaveURL(/\/product\//);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    await page.goto("/product-category/artesanato/");
    await page.evaluate(() => window.scrollTo({ top: 150, behavior: "instant" }));
    const before = await page.evaluate(() => window.scrollY);
    await page.getByLabel("Ordenar por").selectOption("menor_preco");
    await expect(page).toHaveURL(/ordem=menor_preco/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before);
  });
}

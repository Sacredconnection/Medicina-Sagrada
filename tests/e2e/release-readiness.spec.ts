import { expect, test } from "@playwright/test";

test("archives preserve posts, products, pagination and invalid-page handling", async ({ page }) => {
  await page.goto("/tag/saberes/");
  await expect(page.getByRole("heading", { level: 1, name: "Saberes" })).toBeVisible();
  await expect(page.locator(".post-list article")).toHaveCount(12);
  await page.getByRole("link", { name: "Próxima página" }).click();
  await expect(page).toHaveURL(/\/tag\/saberes\/page\/2\//);
  await expect(page.locator(".post-list article")).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/tag\/saberes\/page\/2\/$/);
  await page.goto("/product-tag/artesanato/");
  await expect(page.locator(".product-card")).toHaveCount(12);
  await page.getByRole("link", { name: "Próxima página" }).click();
  await expect(page).toHaveURL(/\/product-tag\/artesanato\/page\/2\//);
  await expect(page.locator(".product-card").first()).toBeVisible();
  for (const path of ["/tag/inexistente/", "/product-tag/artesanato/page/999/", "/tag/saberes/page/2/extra/"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: /não foi encontrada/i })).toBeVisible();
  }
});

test("discount agrees across archive, product schema and ritual variation API", async ({ page, request }) => {
  await page.goto("/product-tag/ofertas-especiais/");
  const card = page.locator(".product-card");
  await expect(card.locator(".price")).toContainText(/24,00.*116,00/);
  await expect(card.locator(".product-badge")).toHaveText("Oferta");
  await card.getByRole("link").click();
  await expect(page).toHaveURL(/\/product\/produto-em-promocao\//, { timeout: 15_000 });
  await expect.poll(async () => {
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    return schemas.flatMap(text => JSON.parse(text)).find(value => value["@type"] === "Product")?.offers;
  }).toMatchObject({ "@type": "AggregateOffer", lowPrice: "24.00", highPrice: "116.00", priceCurrency: "BRL" });
  const variant = await request.get("/api/ritual-variation/?id=9001");
  expect(variant.ok()).toBe(true);
  expect((await variant.json()).prices.price).toBe("2400");
});

test("revalidation requires authentication, validates input and accepts WordPress payload", async ({ request }) => {
  expect((await request.post("/api/revalidate/", { data: { path: "/" } })).status()).toBe(401);
  const headers = { Authorization: "Bearer test-only-revalidation-secret-not-for-production" };
  for (const data of ["null", '{"path":"//external.example"}', '{"path":42}']) {
    expect((await request.post("/api/revalidate/", { headers: { ...headers, "Content-Type": "application/json" }, data })).status()).toBe(400);
  }
  const response = await request.post("/api/revalidate/", { headers, data: { path: "/" } });
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ revalidated: true, path: "/" });
  expect(await (await request.get("/api/health/")).json()).toEqual({ status: "ok" });
});

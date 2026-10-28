import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`avaliação usa a página original e não coleta credenciais (${width})`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/product/colar-de-sementes/");
    const compose = page.locator(".review-compose");
    await expect(compose.getByRole("link", { name: "Acessar a loja para avaliar" })).toHaveAttribute("href", "http://127.0.0.1:4010/product/colar-de-sementes/#reviews");
    await expect(compose.locator("input, textarea, form")).toHaveCount(0);
    const response = await request.post("/api/reviews/", { data: {} });
    expect(response.status()).toBe(401);
    expect((await response.json()).loginUrl).toBe("/account/");
  });
}

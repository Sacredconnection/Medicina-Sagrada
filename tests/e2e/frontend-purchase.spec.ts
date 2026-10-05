import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`preço, variação e compra preservados após reduzir JavaScript (${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/product/pulseira-artesanal/");
    await expect(page.locator(".purchase-price .rich-text.product-price")).toContainText("R$ 39.00");
    await expect(page.getByRole("button", { name: "Adicionar à sacola", exact: true })).toBeDisabled();
    await page.getByLabel("Escolha uma opção").selectOption("201");
    await expect(page.locator(".purchase-price .rich-text.product-price")).toContainText("R$ 39.00");
    await page.getByLabel("Quantidade", { exact: true }).fill("2");
    await expect(page.locator(".purchase-total")).toContainText("78,00");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.locator(".product-summary").screenshot({ path: `test-results/frontend-purchase-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Adicionar à sacola", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("Pulseira artesanal");
    await expect(page.getByRole("dialog")).toContainText("Quantidade: 2");
    await expect(page.getByRole("dialog")).toContainText("78,00");
  });
}

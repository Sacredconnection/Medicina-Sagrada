import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`promoção dinâmica mantém preço, peso e total coerentes (${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/product/produto-em-promocao/");
    const price = page.locator(".purchase-price .product-price");
    await expect(price.locator("del")).toContainText("145,00");
    await expect(price.locator("del")).toHaveCSS("text-decoration-line", "line-through");
    await expect(price.locator(".purchase-current-price")).toContainText("24,00");
    await expect(price.locator(".purchase-current-price")).toContainText("116,00");
    const options = page.getByRole("group", { name: "Escolha o peso", exact: true });
    await expect(options.getByRole("radio", { name: /100 g Esgotado/ })).toBeDisabled();
    const small = options.getByRole("radio", { name: /10 g/ });
    await small.check();
    await expect(price.locator(".purchase-current-price")).toContainText("24,00");
    await page.getByLabel("Quantidade", { exact: true }).fill("2");
    await expect(page.locator(".purchase-total")).toContainText("48,00");
    await small.focus();
    await page.keyboard.press("ArrowRight");
    await expect(options.getByRole("radio", { name: /20 g/ })).toBeChecked();
    await expect(price.locator(".purchase-current-price")).toContainText("45,60");
    await expect(page.getByLabel("Quantidade", { exact: true })).toHaveValue("1");
    await options.getByRole("radio", { name: /50 g/ }).check();
    await page.getByLabel("Quantidade", { exact: true }).fill("2");
    await expect(page.locator(".purchase-total")).toContainText("232,00");
    await page.locator(".product-summary").screenshot({ path: `test-results/promotion-swatches-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Adicionar à sacola", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("232,00");
  });
}

test("produto simples em oferta destaca o preço atual", async ({ page }) => {
  await page.goto("/product/produto-com-oferta/");
  await expect(page.locator(".purchase-price .product-price del")).toContainText("30,00");
  await expect(page.locator(".purchase-price .purchase-current-price")).toContainText("24,00");
  await expect(page.locator(".purchase-total")).toContainText("24,00");
  await expect(page.locator(".purchase-swatches")).toHaveCount(0);
});

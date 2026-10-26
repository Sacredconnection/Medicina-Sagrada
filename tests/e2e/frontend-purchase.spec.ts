import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`preço, variação e compra preservados após reduzir JavaScript (${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/product/pulseira-artesanal/");
    await expect(page.locator(".purchase-price .product-price")).toContainText("39,00");
    await expect(page.getByRole("button", { name: "Adicionar à sacola", exact: true })).toBeDisabled();
    await page.getByRole("radio", { name: /P R\$ 39,00/ }).check();
    await expect(page.locator(".purchase-price .product-price")).toContainText("39,00");
    await page.getByLabel("Quantidade", { exact: true }).fill("2");
    await expect(page.locator(".purchase-total")).toContainText("78,00");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.locator(".product-summary").screenshot({ path: `test-results/frontend-purchase-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByText(/Até \d+ unidades? por compra/)).toHaveCount(0);
    const navigation = page.getByRole("navigation", { name: "Informações do produto" });
    await expect(navigation.getByRole("link")).toHaveText(["Descrição", "Avaliações", "Relacionados"]);
    for (const [name, id] of [["Descrição", "descricao"], ["Avaliações", "avaliacoes"], ["Relacionados", "relacionados"]]) {
      await navigation.getByRole("link", { name, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
    const sectionOrder = await page.locator("#descricao, #avaliacoes, #relacionados").evaluateAll(sections => sections.map(section => section.id));
    expect(sectionOrder).toEqual(["descricao", "avaliacoes", "relacionados"]);
    await navigation.scrollIntoViewIfNeeded();
    await navigation.screenshot({ path: `test-results/product-tabs-${width}.png` });
    await page.getByRole("button", { name: "Adicionar à sacola", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("Pulseira artesanal");
    await expect(page.getByRole("dialog")).toContainText("Quantidade: 2");
    await expect(page.getByRole("dialog")).toContainText("78,00");
  });
}

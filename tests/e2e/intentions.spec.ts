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
  await expect(page.locator(".intention-context")).not.toHaveAttribute("open", "");
  await expect(page.locator(".product-card-intentions")).toContainText("Coração e conexão");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/intention-mobile.png", fullPage: true });
});

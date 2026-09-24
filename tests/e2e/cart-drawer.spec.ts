import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`sacola lateral abre após adicionar e mantém foco e navegação (${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/product/colar-de-sementes/");
    const add = page.getByRole("button", { name: "Adicionar à sacola" });
    const drawer = page.getByRole("dialog", { name: /Minha sacola/ });
    await expect(drawer).not.toBeVisible();
    await add.click();
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("Colar de sementes");
    await expect(drawer).toContainText("59,00");
    await expect(page.getByRole("button", { name: "Fechar sacola" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    await drawer.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
    await page.screenshot({ path: `test-results/cart-drawer-${width}.png` });
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
    await expect(add).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    await add.click();
    await expect(drawer).toContainText("Quantidade: 2");
    await page.getByRole("button", { name: "Remover Colar de sementes" }).click();
    await expect(drawer).toContainText("Sua sacola está vazia");
    await page.getByRole("button", { name: "Continuar comprando" }).click();
    await expect(drawer).not.toBeVisible();
    if (width === 1280) {
      await page.getByRole("link", { name: "Sacola, 0 itens", exact: true }).click();
      await expect(drawer).toBeVisible();
      await page.mouse.click(10, 400);
      await expect(drawer).not.toBeVisible();
    }
  });
}

test("falha ao adicionar não abre a sacola", async ({ page }) => {
  await page.goto("/product/colar-de-sementes/");
  await page.route("**/api/cart/", async route => {
    if (route.request().method() === "POST") await route.fulfill({ status: 502, json: { error: "Não foi possível adicionar." } });
    else await route.continue();
  });
  await page.getByRole("button", { name: "Adicionar à sacola" }).click();
  await expect(page.locator(".purchase-panel [role=alert]")).toContainText("Não foi possível adicionar.");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

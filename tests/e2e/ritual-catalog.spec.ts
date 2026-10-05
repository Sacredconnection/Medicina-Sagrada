import { expect, test } from "@playwright/test";

// Run with RITUAL_CATALOG_FIXTURE=1 for the fixture web server.
test.skip(process.env.RITUAL_CATALOG_FIXTURE !== "1", "Requires the dedicated ritual catalog fixture.");
for (const [width, route] of [[1280, "/product/colar-de-sementes/"], [390, "/"]] as const) {
  test(`catálogo compacto mantém resultado, variação e carrinho (${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    // Force the browser to use the catalog props, then confirm the variation live.
    await page.route("**/api/ritual-recommendation/**", request => request.fulfill({ status: 503, json: { error: "Teste de fallback" } }));
    await page.goto(route);
    const matcher = page.locator("section[aria-labelledby='matcher-title']");
    await matcher.getByRole("button", { name: "Iniciar Jornada" }).click();
    await matcher.getByRole("button", { name: /Aterramento & Presença/ }).click();
    await matcher.locator(".matcher-experience-card").first().click();
    await expect(matcher.locator(".ritual-product").first()).toContainText("Rapé de teste");
    const buy = matcher.getByRole("button", { name: "Comprar apenas o rapé" });
    await expect(buy).toBeDisabled();
    await matcher.getByRole("radio", { name: "10g", exact: true }).click();
    await expect(matcher.locator(".ritual-product").first()).toContainText(/49,00/);
    await expect(buy).toBeEnabled();
    await page.evaluate(() => document.fonts.ready);
    await matcher.screenshot({ path: `test-results/ritual-catalog-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await buy.click();
    await expect(page.getByRole("dialog")).toContainText("Rapé de teste");
    await expect(page.getByRole("dialog")).toContainText("49,00");
  });
}

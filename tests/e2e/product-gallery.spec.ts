import { expect, test } from "@playwright/test";

for (const width of [390, 768, 1920]) {
  test(`galeria usa resolução adequada e preserva miniaturas e zoom (${width})`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3017/product/colar-de-sementes/");
    const main = page.locator(".product-main-image img");
    await expect(main).toBeVisible();
    await expect.poll(() => main.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const optimizedWidth = await main.evaluate(img => Number(new URL((img as HTMLImageElement).currentSrc).searchParams.get("w")));
    expect(optimizedWidth).toBeGreaterThan(0);
    await expect(page.locator(".product-expanded-image")).toHaveCount(0);
    // Compare browser selection against the previous sizing hint on the same image.
    await main.evaluate(img => img.setAttribute("sizes", "(max-width: 800px) 100vw, 50vw"));
    await expect.poll(() => main.evaluate(img => (img as HTMLImageElement).complete)).toBe(true);
    const previousWidth = await main.evaluate(img => Number(new URL((img as HTMLImageElement).currentSrc).searchParams.get("w")));
    expect(optimizedWidth).toBeLessThanOrEqual(previousWidth);
    if (width === 768) expect(optimizedWidth).toBeLessThan(previousWidth);
    console.log(JSON.stringify({ viewport: width, optimizedWidth, previousWidth }));
    await page.reload();
    await page.getByRole("button", { name: "Ver imagem 2 de Colar de sementes" }).click();
    await expect(page.getByRole("button", { name: "Ver imagem 2 de Colar de sementes" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Ampliar imagem 2 de Colar de sementes" }).click();
    const dialog = page.getByRole("dialog", { name: "Imagem ampliada de Colar de sementes" });
    await expect(dialog).toBeVisible();
    await expect.poll(() => dialog.locator("img").evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.evaluate(() => document.fonts.ready);
    await dialog.screenshot({ path: `test-results/gallery-zoom-${width}.png` });
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(page.locator(".product-expanded-image")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  });
}

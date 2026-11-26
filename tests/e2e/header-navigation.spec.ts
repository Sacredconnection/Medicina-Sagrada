import { expect, test } from "@playwright/test";

for (const width of [390, 1280]) {
  test(`menu separa a navegação e a expansão de Aprenda (${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/cart/");
    if (width === 390) await page.locator(".mobile-menu-toggle").click();

    const nav = page.locator(width === 390 ? ".mobile-nav" : ".desktop-nav");
    const link = nav.getByRole("link", { name: "Aprenda", exact: true });
    const toggle = nav.locator('summary[aria-label="Submenu de Aprenda"]');
    await link.focus();
    await page.keyboard.press("Tab");
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Enter");
    const blog = nav.getByRole("link", { name: "Blog", exact: true });
    await expect(blog).toBeVisible();
    await blog.focus();
    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
    await expect(blog).toBeHidden();
    await toggle.click();
    await blog.click();
    await expect(page).toHaveURL(/\/blog\/$/);
    if (width === 390) await page.locator(".mobile-menu-toggle").click();
    await link.click();
    await expect(page).toHaveURL(/\/aprenda\/$/);
  });
}

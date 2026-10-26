import { expect, test } from "@playwright/test";

for (const failure of ["network", "invalid-json"] as const) {
  test(`sacola e frete explicam falhas sem expor erros do navegador (${failure})`, async ({ page }) => {
    await page.route("**/api/cart/", route => failure === "network"
      ? route.abort("failed")
      : route.fulfill({ status: 502, contentType: "text/html", body: "<html>Bad Gateway</html>" }));
    await page.goto("/cart/");
    await expect(page.locator(".bag-page").getByRole("alert")).toContainText("Não foi possível carregar a sacola. Tente novamente em instantes.");
    await page.unroute("**/api/cart/");

    await page.goto("/product/colar-de-sementes/");
    await page.route("**/api/shipping/", route => failure === "network"
      ? route.abort("failed")
      : route.fulfill({ status: 502, contentType: "text/html", body: "<html>Bad Gateway</html>" }));
    await page.locator("details.product-delivery > summary").click();
    await page.getByLabel("CEP de entrega").fill("01310100");
    await page.getByRole("button", { name: "Calcular", exact: true }).click();
    await expect(page.locator(".shipping-calculator").getByRole("alert")).toHaveText("Não foi possível consultar o frete. Tente novamente em instantes.");
  });
}

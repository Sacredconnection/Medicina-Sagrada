import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`formulário preserva avaliação, limpa senha após erro e permite tentar novamente (${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    let attempts = 0;
    await page.route("**/api/reviews/**", async route => {
      expect(route.request().method()).toBe("POST");
      const payload = route.request().postDataJSON();
      expect(payload.productId).toBe(100);
      expect(payload.rating).toBe(5);
      expect(payload.comment).toBe("Avaliação simulada para teste do formulário.");
      expect(payload.username).toBe("cliente@example.test");
      expect(payload.password).toBe(attempts === 0 ? "senha-ficticia" : "nova-senha-ficticia");
      attempts += 1;
      await route.fulfill(attempts === 1
        ? { status: 503, json: { error: "Falha simulada. Tente novamente." } }
        : { status: 200, json: { message: "Avaliação recebida para moderação." } });
    });
    await page.goto("/product/colar-de-sementes/");
    const form = page.locator("#product-review-form");
    await form.getByRole("radio", { name: "5 estrelas", exact: true }).check();
    await form.getByLabel("Sua avaliação", { exact: true }).fill("Avaliação simulada para teste do formulário.");
    await form.getByLabel("E-mail ou usuário").fill("cliente@example.test");
    await form.getByLabel("Senha da conta").fill("senha-ficticia");
    await form.getByRole("button", { name: "Enviar avaliação" }).click();
    await expect(form.getByRole("alert")).toContainText("Falha simulada");
    await expect(form.getByLabel("Senha da conta")).toHaveValue("");
    await expect(form.getByLabel("Sua avaliação", { exact: true })).toHaveValue("Avaliação simulada para teste do formulário.");
    await expect(form.getByRole("radio", { name: "5 estrelas", exact: true })).toBeChecked();
    await form.getByLabel("Senha da conta").fill("nova-senha-ficticia");
    await form.getByRole("button", { name: "Enviar avaliação" }).click();
    await expect(page.locator(".review-compose").getByRole("status")).toContainText("recebida para moderação");
    await expect(page.locator(".review")).toHaveCount(5);
    expect(attempts).toBe(2);
  });
}

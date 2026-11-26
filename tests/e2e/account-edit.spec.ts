import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([{ name: "ms_customer_session", value: "account-edit-test", url: baseURL! }]);
});

test("perfil mantém a edição após senha incorreta e permite salvar novamente", async ({ page }) => {
  await page.goto("/account/?tab=details");
  await page.getByLabel("Nome de exibição").fill("Nome editado");
  await page.getByLabel("E-mail", { exact: true }).fill("novo@example.com");
  const password = page.getByLabel("Senha atual", { exact: false });
  await password.fill("incorreta");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("Confira a senha atual");
  await expect(page.getByLabel("Nome de exibição")).toHaveValue("Nome editado");
  await expect(page.getByLabel("E-mail", { exact: true })).toHaveValue("novo@example.com");
  await expect(password).toHaveValue("");
  await password.fill("senha-correta");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByText("Alterações salvas.")).toBeVisible();
});

test("endereço mantém o painel aberto e os valores após indisponibilidade", async ({ page }) => {
  await page.goto("/account/?tab=addresses");
  const address = page.locator("details").filter({ has: page.getByText("Endereço de entrega", { exact: true }) });
  await address.locator("summary").click();
  await address.getByLabel("Rua e número").fill("Rua Um, 42");
  await address.getByLabel("Cidade").fill("Indisponível");
  await address.getByLabel("País (sigla)").fill("BR");
  await address.getByRole("button").click();
  await expect(address.getByRole("alert")).toContainText("Tente novamente");
  await expect(address.getByLabel("Rua e número")).toHaveValue("Rua Um, 42");
  await address.getByLabel("Cidade").fill("Recife");
  await address.getByRole("button").click();
  await expect(address.getByRole("status")).toContainText("Alterações salvas.");
});

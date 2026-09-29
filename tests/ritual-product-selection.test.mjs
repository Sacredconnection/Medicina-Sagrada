import assert from "node:assert/strict";
import test from "node:test";
import { chooseAvailableRitualProduct } from "../lib/ritual-product-selection.ts";

const config = (slug) => ({
  slug,
  perfilAromatico: `${slug} perfil`,
  dosagemSugerida: `${slug} dose`,
});

const product = (slug, options = {}) => ({
  slug,
  type: "variable",
  is_in_stock: true,
  is_purchasable: true,
  ...options,
});

test("substitui o rapé principal sem estoque pelo próximo candidato disponível", () => {
  const result = chooseAvailableRitualProduct(
    [config("principal"), config("alternativo")],
    [
      product("principal", { is_in_stock: false }),
      product("alternativo"),
    ],
    {
      principal: [],
      alternativo: [product("alternativo-10g", { id: 10 })],
    },
  );

  assert.equal(result?.product.slug, "alternativo");
  assert.equal(result?.config.slug, "alternativo");
});

test("não recomenda produto variável sem nenhuma variação comprável", () => {
  const result = chooseAvailableRitualProduct(
    [config("sem-peso"), config("com-peso")],
    [product("sem-peso"), product("com-peso")],
    {
      "sem-peso": [product("sem-peso-10g", { is_in_stock: false })],
      "com-peso": [product("com-peso-10g", { id: 20 })],
    },
  );

  assert.equal(result?.product.slug, "com-peso");
  assert.equal(result?.variations[0]?.id, 20);
});

test("retorna vazio quando nenhum candidato pode ser comprado", () => {
  const result = chooseAvailableRitualProduct(
    [config("esgotado")],
    [product("esgotado", { is_in_stock: false })],
    { esgotado: [] },
  );

  assert.equal(result, null);
});

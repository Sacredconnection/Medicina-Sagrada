import assert from "node:assert/strict";
import test from "node:test";
import { chooseAvailableRitualProduct, getRitualCatalogFallback } from "../lib/ritual-product-selection.ts";
import { ritualsData } from "../lib/rituals-data.ts";

const config = (slug) => ({
  slug,
  perfil: `${slug} perfil`,
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

test("não introduz produto fora da lista curada da combinação", () => {
  const result = chooseAvailableRitualProduct(
    [config("alinhado-esgotado")],
    [
      product("alinhado-esgotado", { is_in_stock: false }),
      product("disponivel-mas-nao-curado"),
    ],
    {
      "alinhado-esgotado": [],
      "disponivel-mas-nao-curado": [product("disponivel-mas-nao-curado-10g")],
    },
  );

  assert.equal(result, null);
});

test("mantém uma curadoria principal específica para cada intenção e experiência", () => {
  const expectedPrimary = {
    "grounding:beginner": "huni-kuin-murici",
    "grounding:practitioner": "rape-xamanico-parica",
    "strength:beginner": "rape-xamanico-tsunu-forca",
    "strength:practitioner": "rape-xamanico-tsunu-extra",
    "serenity:beginner": "rape-shawadawa-relax",
    "serenity:practitioner": "rape-kuntanawa-tete-pawa",
    "heart:beginner": "caboclo-rosas-brancas",
    "heart:practitioner": "rape-xamanico-espiritual",
    "purification:beginner": "rape-huni-kuin-capemba",
    "purification:practitioner": "rape-nukini-limpeza-astral",
  };

  for (const [key, slug] of Object.entries(expectedPrimary)) {
    assert.equal(ritualsData[key].produtoPrincipal.candidatos[0].slug, slug);
  }
});

test("não mistura automaticamente candidatos de iniciante e praticante", () => {
  for (const intention of ["grounding", "strength", "serenity", "heart", "purification"]) {
    const beginner = new Set(
      ritualsData[`${intention}:beginner`].produtoPrincipal.candidatos.map(({ slug }) => slug),
    );
    const practitioner = ritualsData[
      `${intention}:practitioner`
    ].produtoPrincipal.candidatos.map(({ slug }) => slug);

    assert.equal(practitioner.some((slug) => beginner.has(slug)), false);
  }
});


test("preserva cartoes reais quando a consulta de variacoes falha", () => {
  const result = getRitualCatalogFallback(
    [config("principal")], "aplicador", [product("principal"), product("aplicador")],
  );
  assert.equal(result.primary.product.slug, "principal");
  assert.deepEqual(result.primary.variations, []);
  assert.equal(result.applicator.product.slug, "aplicador");
});

test("fallback ignora esgotados e mantem a curadoria da experiencia", () => {
  const result = getRitualCatalogFallback(
    [config("esgotado"), config("alternativa")], "aplicador",
    [product("esgotado", { is_in_stock: false }), product("alternativa"), product("fora-da-curadoria")],
  );
  assert.equal(result.primary.product.slug, "alternativa");
  assert.equal(result.applicator, null);
});

import assert from "node:assert/strict";
import test from "node:test";
import { toRitualCatalog } from "../lib/ritual-catalog.ts";
import { getRitualCatalogFallback } from "../lib/ritual-product-selection.ts";
import { ritualsData } from "../lib/rituals-data.ts";

const product = (slug, id) => ({
  id, slug, name: `Nome &amp; ${slug}`, type: "variable", is_in_stock: true, is_purchasable: true,
  prices: { price: "3900", price_range: { min_amount: "3900", max_amount: "4900" }, currency_code: "BRL", currency_minor_unit: 2, regular_price: "4900" },
  images: [{ id: 1, src: "/first.webp", thumbnail: "/thumb.webp", alt: "Primeira foto", srcset: "extra" }, { id: 2, src: "/unused.webp" }],
  variations: [{ id: id + 1000, attributes: [{ name: "Peso", value: "10g" }] }],
  description: "Texto editorial longo ".repeat(100), short_description: "Resumo", price_html: "<span>39</span>",
  categories: [{ id: 1, slug: "rape" }], review_count: 123,
});

test("catálogo compacto preserva preços, primeira imagem, opções e disponibilidade sem alterar a origem", () => {
  const source = [product("teste", 1), { ...product("esgotado", 2), images: [], is_in_stock: false, is_purchasable: false }];
  const before = structuredClone(source);
  const compact = toRitualCatalog(source);
  assert.deepEqual(source, before);
  assert.deepEqual(compact[0].variations, source[0].variations);
  assert.deepEqual(compact[0].prices, { price: "3900", price_range: { min_amount: "3900", max_amount: "4900" }, currency_code: "BRL", currency_minor_unit: 2 });
  assert.deepEqual(compact[0].images, [{ id: 1, src: "/first.webp", thumbnail: "/thumb.webp", alt: "Primeira foto" }]);
  assert.equal(compact[0].name, source[0].name);
  assert.deepEqual(compact[1].images, []);
  assert.equal(compact[1].is_in_stock, false);
  assert.equal(compact[1].is_purchasable, false);
  for (const key of ["description", "short_description", "price_html", "categories", "review_count"]) assert.equal(key in compact[0], false);
  assert.ok(JSON.stringify(compact).length < JSON.stringify(source).length);
  assert.deepEqual(toRitualCatalog([]), []);
});

test("todas as curadorias escolhem os mesmos produtos antes e depois da redução, inclusive com indisponibilidade", () => {
  const slugs = [...new Set(Object.values(ritualsData).flatMap(r => [...r.produtoPrincipal.candidatos.map(c => c.slug), r.aplicador.slug]))];
  const catalog = slugs.map(product);
  for (const unavailable of [false, true]) {
    const source = catalog.map((p, index) => ({ ...p, is_in_stock: unavailable ? index % 2 === 0 : true }));
    for (const recommendation of Object.values(ritualsData)) {
      const args = [recommendation.produtoPrincipal.candidatos, recommendation.aplicador.slug];
      const original = getRitualCatalogFallback(...args, source);
      const compact = getRitualCatalogFallback(...args, toRitualCatalog(source));
      for (const slot of ["primary", "applicator"]) {
        assert.equal(compact[slot]?.product.id, original[slot]?.product.id);
        if (original[slot]) assert.deepEqual(compact[slot].product, toRitualCatalog([original[slot].product])[0]);
      }
    }
  }
});

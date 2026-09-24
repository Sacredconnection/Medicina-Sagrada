import test from "node:test";
import assert from "node:assert/strict";
import { parseCatalogQuery, catalogSearch } from "../lib/catalog-query.ts";

test("filtros usam centavos e permitem apenas ordens e intervalos válidos", () => {
  const value = parseCatalogQuery({ min: "12,34", max: "500.50", ordem: "menor_preco", estoque: "1", pagina: "2", q: "  colar  " });
  assert.equal(value.min, 1234); assert.equal(value.max, 50050); assert.equal(value.page, 2);
  assert.equal(catalogSearch(value).toString(), "q=colar&ordem=menor_preco&min=12.34&max=500.5&estoque=1");
  for (const min of ["-1", "1e4", "NaN", "<script>", "1234567"]) assert.equal(parseCatalogQuery({ min }).invalidPrice, true);
  assert.equal(parseCatalogQuery({ min: "50", max: "10" }).min, undefined);
  assert.equal(parseCatalogQuery({ ordem: "__proto__", pagina: "999999", categoria: "-1" }).sort, "destaque");
});

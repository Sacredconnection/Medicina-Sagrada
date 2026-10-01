import assert from "node:assert/strict";
import test from "node:test";
import { selectOtherEthnicityProducts } from "../lib/other-ethnicity-products.ts";

const product = (id, categoryIds, extra = {}) => ({
  id, categories: categoryIds.map((id) => ({ id })), ...extra,
});

test("exclui a etnia atual mesmo em produtos atribuídos a mais de um povo", () => {
  const result = selectOtherEthnicityProducts([
    product(1, [10]), product(2, [10, 20]), product(3, [20]),
    product(4, [30]), product(5, [40]), product(6, [50]), product(7, [60]),
  ], [10], [20, 30, 40, 50, 60]);
  assert.deepEqual(result.map(({ id }) => id), [3, 4, 5, 6]);
});

test("seleciona povos distintos e evita produtos indisponíveis ou sem origem identificada", () => {
  const result = selectOtherEthnicityProducts([
    product(1, [20], { is_in_stock: false }),
    product(2, [20], { is_purchasable: false }),
    product(3, [99]), product(4, [20]), product(5, [20]),
    product(6, [30]), product(7, [40]),
  ], [10], [20, 30, 40]);
  assert.deepEqual(result.map(({ id }) => id), [4, 6, 7]);
});

test("não completa a faixa com a etnia atual quando faltam alternativas", () => {
  assert.deepEqual(selectOtherEthnicityProducts([product(1, [10])], [10], [20]), []);
  assert.equal(selectOtherEthnicityProducts([product(2, [20])], [10], [20]).length, 1);
});

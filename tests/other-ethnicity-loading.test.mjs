import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import * as jsxRuntime from "react/jsx-runtime";
import { getEthnicityTheme } from "../lib/ethnicity-colors.ts";
import { selectOtherEthnicityProducts } from "../lib/other-ethnicity-products.ts";

const source = ts.transpileModule(readFileSync(new URL("../components/other-ethnicity-products.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const category = (id, slug, parent = 1) => ({ id, slug, name: slug, parent });
const current = category(10, "huni-kuin");
const categories = [category(1, "rape", 0), current, category(20, "apurina"), category(30, "nukini"), category(40, "katukina"), category(50, "kuntanawa")];
const product = (id, ids, extra = {}) => ({ id, categories: ids.map(id => ({ id })), ...extra });

async function load(pages, choices = categories) {
  const calls = [];
  const compiled = { exports: {} };
  const require = name => {
    if (name === "react/jsx-runtime") return jsxRuntime;
    if (name === "@/lib/ethnicity-colors") return { getEthnicityTheme };
    if (name === "@/lib/other-ethnicity-products") return { selectOtherEthnicityProducts };
    if (name === "@/components/product-card") return { ProductCard: "test-card" };
    if (name === "@/lib/woocommerce") return { getProducts: async options => {
      calls.push(options);
      const page = pages[options.page - 1];
      if (page instanceof Error) throw page;
      return page ?? [];
    } };
    throw new Error(`Unexpected import: ${name}`);
  };
  new Function("require", "module", "exports", source)(require, compiled, compiled.exports);
  const element = await compiled.exports.OtherEthnicityProducts({ category: current, categories: choices });
  const cards = element?.props.children[1].props.children ?? [];
  return { calls, ids: cards.map(card => card.props.product.id), element };
}

test("não consulta catálogo sem outros povos cadastrados, incluindo aliases da origem atual", async () => {
  const result = await load([], [categories[0], current, category(11, "rape-huni-kuin")]);
  assert.deepEqual(result.calls, []);
  assert.equal(result.element, null);
});

test("para assim que todos os povos alternativos estão representados, mesmo com página cheia", async () => {
  const batch = Array.from({ length: 100 }, (_, i) => product(i + 1, [20, 30]));
  const result = await load([batch], categories.slice(0, 4));
  assert.equal(result.calls.length, 1);
  assert.deepEqual(result.ids, [1]);
});

test("mantém seleção e ordem através de páginas com descartes, esgotados e duplicatas", async () => {
  const first = [product(1, [20]), ...Array.from({ length: 99 }, (_, i) => product(i + 2, [10]))];
  const second = [product(1, [20]), product(101, [30], { is_in_stock: false }), product(102, [20]), product(103, [30]), product(104, [40]), product(105, [50])];
  const result = await load([first, second]);
  assert.deepEqual(result.ids, selectOtherEthnicityProducts([...first, ...second], [10], [20, 30, 40, 50]).map(p => p.id));
  assert.deepEqual(result.ids, [1, 103, 104, 105]);
  assert.deepEqual(result.calls.map(c => c.page), [1, 2]);
  assert.ok(result.calls.every(c => c.categoryId === 1 && c.perPage === 100));
});

test("encerra na última página sem preencher com origem atual ou produto indisponível", async () => {
  const result = await load([[product(1, [10]), product(2, [20], { is_purchasable: false })]]);
  assert.equal(result.calls.length, 1);
  assert.equal(result.element, null);
});

test("preserva os cards já encontrados quando a próxima página falha", async t => {
  t.mock.method(console, "warn", () => {});
  const first = [product(1, [20]), ...Array.from({ length: 99 }, (_, i) => product(i + 2, [10]))];
  const result = await load([first, new Error("Falha simulada")]);
  assert.deepEqual(result.ids, [1]);
  assert.equal(result.calls.length, 2);
  assert.equal(console.warn.mock.callCount(), 1);
});

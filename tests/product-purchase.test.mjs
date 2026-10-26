import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import * as jsxRuntime from "react/jsx-runtime";
import { getPurchasePrice } from "../lib/purchase-price.ts";

const source = ts.transpileModule(readFileSync(new URL("../components/product-purchase.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const compiled = { exports: {} };
const require = name => {
  if (name === "react/jsx-runtime") return jsxRuntime;
  if (name === "@/lib/purchase-price") return { getPurchasePrice };
  if (name === "@/components/product-purchase-controls") return { ProductPurchaseControls: "test-controls" };
  throw new Error(`Unexpected import: ${name}`);
};
new Function("require", "module", "exports", source)(require, compiled, compiled.exports);

test("envia preços numéricos sem HTML executável ao navegador e preserva o catálogo", () => {
  const prices = { price: "4900", regular_price: "4900", price_range: null, currency_symbol: "R$", currency_prefix: "R$", currency_suffix: "", currency_decimal_separator: ",", currency_thousand_separator: ".", currency_minor_unit: 2 };
  const product = { id: 10, prices, price_html: '<span>R$ 49,00</span><script>alert(1)</script>' };
  const variants = [{ id: 11, prices, price_html: '<del>R$ 49,00</del><ins>R$ 39,00</ins><img src="x" onerror="alert(1)">' }];
  const original = structuredClone({ product, variants });
  const element = compiled.exports.ProductPurchase({ product, variants, originalUrl: "https://cms.example/product/test/" });
  assert.equal(element.props.product.price_html, "");
  assert.equal(element.props.variants[0].price_html, "");
  assert.deepEqual(element.props.prices[11], { amount: "3900", regular: "4900" });
  assert.doesNotMatch(element.props.product.price_html + element.props.variants[0].price_html, /script|onerror|alert\(/);
  assert.deepEqual({ product, variants }, original);
  assert.equal(element.props.variants[0].id, 11);
  assert.equal(element.props.originalUrl, "https://cms.example/product/test/");
});

const currency = { price: "3000", regular_price: "3000", sale_price: "3000", price_range: null, currency_symbol: "R$", currency_prefix: "R$", currency_suffix: "", currency_decimal_separator: ",", currency_thousand_separator: ".", currency_minor_unit: 2 };
const amount = value => `<span class="woocommerce-Price-amount amount"><span class="woocommerce-Price-currencySymbol">&#082;&#036;</span>${value}</span>`;
const promotion = (original, discounted) => `<span class="yaydp-discounted-price"><span class="yaydp-original-prices"><del>${original.map(amount).join(' &#8211; ')}</del></span><span class="yaydp-calculated-prices"><ins aria-hidden="true">${discounted.map(amount).join(' &#8211; ')}</ins></span></span>`;

test("lê a promoção dinâmica por peso mesmo quando os preços numéricos não têm desconto", () => {
  for (const [original, discounted, expected] of [["30,00", "24,00", "2400"], ["57,00", "45,60", "4560"], ["145,00", "116,00", "11600"]]) {
    assert.equal(getPurchasePrice({ prices: currency, price_html: promotion([original], [discounted]) }).amount, expected);
  }
  assert.deepEqual(getPurchasePrice({ prices: currency, price_html: promotion(["30,00", "145,00"], ["24,00", "116,00"]) }), { amount: "2400", maximum: "11600", regular: "3000", regularMaximum: "14500" });
});

test("preserva preços normais, promoções nativas e intervalos sem inventar descontos", () => {
  assert.deepEqual(getPurchasePrice({ prices: currency, price_html: "" }), { amount: "3000" });
  assert.deepEqual(getPurchasePrice({ prices: { ...currency, price: "2400", sale_price: "2400" }, price_html: "" }), { amount: "2400", regular: "3000" });
  assert.deepEqual(getPurchasePrice({ prices: { ...currency, price_range: { min_amount: "3000", max_amount: "14500" } }, price_html: "" }), { amount: "3000", maximum: "14500" });
  assert.deepEqual(getPurchasePrice({ prices: currency, price_html: promotion(["1.234,56"], ["987,65"]) }), { amount: "98765", regular: "123456" });
  assert.deepEqual(getPurchasePrice({ prices: currency, price_html: promotion(["30,00"], ["0,00"]) }), { amount: "0", regular: "3000" });
});

test("ignora promoções ambíguas ou malformadas e valores ausentes", () => {
  for (const html of [promotion(["30,00"], ["40,00"]), promotion(["30,00"], ["24,999"]), promotion(["30,00"], ["24,00", "30,00"]), '<del>R$ 30,00</del><ins>Consulte as condições</ins>', promotion(["30,00"], ["24,00"]) + '<ins>R$ 10,00</ins>']) {
    assert.deepEqual(getPurchasePrice({ prices: currency, price_html: html }), { amount: "3000" });
  }
  assert.equal(getPurchasePrice({ prices: { ...currency, price: "" }, price_html: "" }), null);
});

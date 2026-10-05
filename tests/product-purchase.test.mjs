import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import * as jsxRuntime from "react/jsx-runtime";
import { cleanHtml } from "../lib/html.ts";

const source = ts.transpileModule(readFileSync(new URL("../components/product-purchase.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const compiled = { exports: {} };
const require = name => {
  if (name === "react/jsx-runtime") return jsxRuntime;
  if (name === "@/lib/html") return { cleanHtml };
  if (name === "@/components/product-purchase-controls") return { ProductPurchaseControls: "test-controls" };
  throw new Error(`Unexpected import: ${name}`);
};
new Function("require", "module", "exports", source)(require, compiled, compiled.exports);

test("sanitiza preços de produto e variações antes de enviá-los ao navegador sem alterar o catálogo", () => {
  const product = { id: 10, price_html: '<span>R$ 39,00</span><script>alert(1)</script>' };
  const variants = [{ id: 11, price_html: '<del>R$ 49,00</del><ins>R$ 39,00</ins><img src="x" onerror="alert(1)">' }];
  const original = structuredClone({ product, variants });
  const element = compiled.exports.ProductPurchase({ product, variants, originalUrl: "https://cms.example/product/test/" });
  assert.equal(element.props.product.price_html, cleanHtml(product.price_html));
  assert.equal(element.props.variants[0].price_html, cleanHtml(variants[0].price_html));
  assert.doesNotMatch(element.props.product.price_html + element.props.variants[0].price_html, /script|onerror|alert\(/);
  assert.deepEqual({ product, variants }, original);
  assert.equal(element.props.variants[0].id, 11);
  assert.equal(element.props.originalUrl, "https://cms.example/product/test/");
});

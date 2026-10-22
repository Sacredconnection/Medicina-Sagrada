import assert from "node:assert/strict";
import test from "node:test";
import { getCategoryDescription } from "../lib/category-descriptions.ts";

test("replaces only the main Rapé category description", () => {
  const fallback = "<p>Descrição original.</p>";
  const description = getCategoryDescription("/product-category/rape/", fallback);

  assert.match(description, /saberes ancestrais que atravessam gerações/);
  assert.match(description, /respeito, presença e consciência/);
  assert.doesNotMatch(description, /cura/i);
  assert.equal(
    getCategoryDescription("/product-category/sananga/", fallback),
    fallback,
  );
});

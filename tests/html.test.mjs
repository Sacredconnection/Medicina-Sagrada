import assert from "node:assert/strict";
import test from "node:test";
import { cleanHtml } from "../lib/html.ts";

test("remove títulos da descrição sem remover o texto restante", () => {
  const html = cleanHtml(
    "<h2>RAPÉ HUNI KUIN:</h2><p>Texto introdutório.</p><div>Texto complementar.</div>",
    undefined,
    { removeHeadings: true },
  );

  assert.equal(html, "<p>Texto introdutório.</p><div>Texto complementar.</div>");
});

test("preserva títulos nas demais superfícies de texto rico", () => {
  assert.equal(cleanHtml("<h2>Detalhes</h2><p>Texto.</p>"), "<h2>Detalhes</h2><p>Texto.</p>");
});

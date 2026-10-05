import assert from "node:assert/strict";
import test from "node:test";
import { parseDocument } from "htmlparser2";
import { findAll, textContent } from "domutils";
import { buildCategoryEditorial, prepareCategoryEditorialHtml as prepareEditorial } from "../lib/category-editorial.ts";
import { cleanHtml } from "../lib/html.ts";

const prepareCategoryEditorialHtml = html => prepareEditorial(cleanHtml(html));

test("groups a heading with prose across legacy rows and preserves media and links", () => {
  const html = '<div id="intro" class="row"><div class="col"><h2>Título</h2><p><a href="/foto/"><img src="/foto.png" alt="Foto" width="1180" height="478"></a></p><h2>Assunto</h2></div></div><div class="row"><p>Texto <strong>original</strong> com <a href="/destino/">link</a>.</p></div>';
  const output = prepareCategoryEditorialHtml(html);
  const document = parseDocument(output);
  const sections = findAll(e => e.name === "section", document.children);
  assert.equal(sections.length, 2);
  assert.equal(textContent(sections[1]).replace(/\s+/g, " ").trim(), "Assunto Texto original com link.");
  assert.equal(textContent(document).replace(/\s/g, ""), textContent(parseDocument(html)).replace(/\s/g, ""));
  assert.match(output, /id="intro"/);
  assert.match(output, /class="category-editorial-title"/);
  assert.match(output, /<figure class="category-editorial-media"><a href="\/foto\/">/);
  assert.match(output, /src="\/foto.png" alt="Foto" width="1180" height="478"/);
  assert.match(output, /href="\/destino\/"/);
  assert.doesNotMatch(output, /class="row"|class="col"/);
});

test("preserves lists, quotes, inline icons and deliberate internal breaks", () => {
  const output = prepareCategoryEditorialHtml('<h2>Guia</h2><p>&nbsp;<br></p><p>Busca <img src="/search-icon.svg" alt=""> disponível.</p><ul><li><p>Primeiro</p></li><li>Segundo</li></ul><blockquote><p>Nota<br>complementar</p></blockquote><hr><h2>Continuação</h2><p>Final.</p>');
  assert.match(output, /<ul><li><p>Primeiro<\/p><\/li><li>Segundo<\/li><\/ul>/);
  assert.match(output, /<blockquote><p>Nota<br>complementar<\/p><\/blockquote>/);
  assert.match(output, /<p>Busca <img src="\/search-icon.svg" alt> disponível.<\/p>/);
  assert.doesNotMatch(output, /<hr>|&nbsp;|<figure/);
});

test("normalizes heading levels, keeps standalone dividers and sanitizes source HTML", () => {
  const output = prepareCategoryEditorialHtml('<h1>Introdução</h1><p>Primeiro</p><hr><p>Segundo</p><script>alert(1)</script><h3>Detalhe</h3>');
  assert.match(output, /<h2[^>]*class="category-editorial-title">Introdução<\/h2>/);
  assert.match(output, /<hr>/);
  assert.match(output, /<h3>Detalhe<\/h3>/);
  assert.doesNotMatch(output, /<h1|<script|alert\(1\)/);
});

test("index targets are stable, unique, and preserve existing fragment destinations", () => {
  const input = '<div id="categoria-uso"><h2>Uso</h2><p>Primeiro.</p></div><h2>Uso</h2><h2 id="origem">Origem &amp; tradição</h2>';
  const content = buildCategoryEditorial(cleanHtml(input));
  assert.deepEqual(content.items, [
    { id: "categoria-uso-2", label: "Uso" },
    { id: "categoria-uso-3", label: "Uso" },
    { id: "origem", label: "Origem & tradição" },
  ]);
  const headings = findAll(e => e.name === "h2", parseDocument(cleanHtml(content.html)).children);
  assert.deepEqual(headings.map(e => e.attribs.id), content.items.map(item => item.id));
  assert.deepEqual(buildCategoryEditorial(cleanHtml(input)), content);
  assert.equal(buildCategoryEditorial("<p>Texto sem títulos.</p>").items.length, 0);
});

import assert from "node:assert/strict";
import test from "node:test";
import { articleCtas, contextualizeArticleCta, getArticleCta } from "../lib/article-cta.ts";
import { cleanHtml, prepareArticleHtml } from "../lib/html.ts";

const post = (slug, title = "Rapé", html = "<p>Texto da matéria.</p>") => ({ slug, title: { rendered: title }, content: { rendered: html } });

test("as 12 matérias têm convites próprios e categorias locais", () => {
  assert.equal(Object.keys(articleCtas).length, 12);
  for (const [slug, cta] of Object.entries(articleCtas)) {
    const html = cleanHtml(contextualizeArticleCta(post(slug), "<p>Conteúdo original.</p>"));
    assert.match(html, /Conteúdo original/);
    assert.equal((html.match(/class="article-shop-cta"/g) ?? []).length, 1);
    assert.ok(html.includes(`href="${cta.href}"`));
    assert.ok(cta.href.startsWith("/product-category/"));
    assert.ok(html.includes(cta.label));
  }
});

test("substitui botões antigos no lugar e evita CTAs repetidos", () => {
  const content = post("conheca-os-kenes-os-grafismos-sagrados-indigenas");
  const html = prepareArticleHtml('<p>Introdução.</p>[button text="COMPRE AGORA" link="https://medicinasagrada.com.br/product-category/artesanato/micangas/"]<h3>Fontes</h3><p>Referência preservada.</p>[ux_featured_products title="Conheça também"]');
  const result = contextualizeArticleCta(content, html);
  assert.equal((result.match(/class="article-shop-cta"/g) ?? []).length, 1);
  assert.doesNotMatch(result, /COMPRE AGORA|article-inline-cta/);
  assert.ok(result.indexOf("article-shop-cta") < result.indexOf("<h3>Fontes"));
  assert.match(result, /Referência preservada/);
});

test("novas matérias priorizam o assunto do título sobre menções no texto", () => {
  assert.equal(getArticleCta(post("nova", "Grafismos e miçangas", "<p>Rapé e Sananga.</p>")).href, "/product-category/artesanato/");
  assert.equal(getArticleCta(post("nova", "Como escolher um kuripe", "<p>Rapé</p>")).href, "/product-category/acessorios/aplicadores/");
  assert.equal(getArticleCta(post("nova", "Sananga na tradição amazônica")).href, "/product-category/medicinais/sananga-medicinais/");
  assert.doesNotMatch(getArticleCta(post("nova", "Os Huni Kuin")).description, /Baimuka|Xipaô/);
});

test("preserva links editoriais e substitui apenas o grupo de botões comerciais", () => {
  const html = '<p><a href="/product-category/rape/">Referência no texto</a></p><div class="wp-block-buttons"><div class="wp-block-button"><a href="/product-category/rape/">Comprar</a></div></div><div class="wp-block-buttons"><a href="https://example.org/">Fonte externa</a></div>';
  const result = contextualizeArticleCta(post("rape"), html);
  assert.match(result, /Referência no texto/);
  assert.match(result, /Fonte externa/);
  assert.doesNotMatch(result, />Comprar</);
});

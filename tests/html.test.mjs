import assert from "node:assert/strict";
import test from "node:test";
import {
  articleShortcodeMediaIds,
  cleanHtml,
  prepareArticleHtml,
} from "../lib/html.ts";

test("remove títulos da descrição sem remover o texto restante", () => {
  const html = cleanHtml(
    "<h2>RAPÉ HUNI KUIN:</h2><p>Texto introdutório.</p><div>Texto complementar.</div>",
    undefined,
    { removeHeadings: true },
  );

  assert.equal(html, "<p>Texto introdutório.</p><div>Texto complementar.</div>");
});

test("converte shortcodes editoriais antigos em conteudo utilizavel", () => {
  const html = prepareArticleHtml(
    '[section][ux_video url=&#8221;https://youtu.be/abc123&#8221;][ux_image id=&#8221;42&#8243; link=&#8221;https://medicinasagrada.com.br/produto/&#8221;][/section]',
    [{
      id: 42,
      source_url: "https://medicinasagrada.com.br/wp-content/uploads/imagem.jpg",
      alt_text: "Imagem da materia",
      media_details: { width: 1200, height: 800 },
    }],
  );

  assert.doesNotMatch(html, /\[(?:section|ux_video|ux_image)/);
  assert.match(html, /youtube-nocookie\.com\/embed\/abc123/);
  assert.match(html, /href="\/produto\/"/);
  assert.match(html, /alt="Imagem da materia"/);
});

test("encontra ids de midia usados pelos shortcodes do WordPress", () => {
  assert.deepEqual(
    articleShortcodeMediaIds('[ux_banner bg=&#8221;15&#8243;][ux_image id="27"][ux_image id="27"]'),
    [15, 27],
  );
});

test("preserva títulos nas demais superfícies de texto rico", () => {
  assert.equal(cleanHtml("<h2>Detalhes</h2><p>Texto.</p>"), "<h2>Detalhes</h2><p>Texto.</p>");
});

test("remove parágrafos de espaçamento e agrupa fontes sem perder links ou imagens", () => {
  const html = prepareArticleHtml('<h2>Assunto</h2><p>&nbsp;<br></p><p>Texto.</p><h6><b><i>Fontes:</i></b></h6><p>&nbsp;</p><p><a href="https://example.org">Referência</a></p><p><img src="/imagem.webp" alt="Documento"></p><h2>Outro assunto</h2><p>Continuação.</p>');
  assert.match(html, /class="article-sources"/);
  assert.doesNotMatch(html, /<p>(?:&nbsp;|\s|<br>)*<\/p>/);
  assert.match(html, /href="https:\/\/example.org"/);
  assert.match(html, /src="\/imagem.webp"/);
  assert.match(html, /<\/section><h2>Outro assunto<\/h2>/);
  assert.match(html, /Continuação/);
});

test("corrige títulos vazios e botões antigos envolvidos em títulos", () => {
  const html = prepareArticleHtml('<h3><span>&nbsp;</span></h3><h6>[button text="Explorar" link="/product-category/rape/"]</h6><p><i></i></p>');
  assert.doesNotMatch(html, /<h[1-6]|<p><i>/);
  assert.match(html, /article-inline-cta/);
});

test("retira quebras de espaçamento nas bordas e mantém quebras internas de informação", () => {
  const html = prepareArticleHtml('<p><span><br></span><em>Primeiro texto.<br></em></p><p><em>Tabaco: Sabiá</em><br><em>Cinza: Caneleiro</em></p>');
  assert.doesNotMatch(html, /<br><\/em>|<span><br>/);
  assert.match(html, /Tabaco: Sabiá<\/em><br><em>Cinza: Caneleiro/);
});

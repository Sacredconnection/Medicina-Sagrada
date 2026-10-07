import assert from "node:assert/strict";
import test from "node:test";
import {
  articleShortcodeMediaIds,
  cleanHtml,
  prepareArticleHtml,
} from "../lib/html.ts";

test("removes executable CMS content and protects external new-tab links", () => {
  const html = cleanHtml('<script>alert(1)</script><img src="/photo.jpg" onerror="alert(1)"><a href="javascript:alert(1)">Unsafe</a><a href="//external.example" target="_blank" rel="opener">External</a>');
  assert.doesNotMatch(html, /<script|onerror|javascript:|rel="opener"/);
  assert.match(html, /href="\/\/external.example" target="_blank" rel="noopener noreferrer"/);
});

test("only approved video hosts retain their source and CMS cannot widen player permissions", () => {
  const html = cleanHtml('<iframe src="https://evil.example/embed" allow="camera; microphone"></iframe><iframe src="https://www.youtube.com/embed/test" allow="camera; microphone; geolocation" referrerpolicy="unsafe-url"></iframe>');
  assert.doesNotMatch(html, /evil\.example|camera|microphone|geolocation|unsafe-url/);
  assert.match(html, /src="https:\/\/www.youtube.com\/embed\/test"/);
  assert.match(html, /picture-in-picture; fullscreen/);
  assert.match(html, /referrerpolicy="strict-origin-when-cross-origin"/);
});

test("preserva variantes responsivas dos banners e encerra o contexto da seção", () => {
  const media = [{ id: 42, source_url: "/banner.png", media_details: { width: 740, height: 300 } }];
  const html = prepareArticleHtml('[section visibility="hide-for-small"][ux_banner bg="42"][/ux_banner][/section][section visibility="show-for-small"][ux_banner bg="42"][/ux_banner][/section][ux_image id="42"]', media);
  assert.match(html, /article-media article-media-desktop/);
  assert.match(html, /article-media article-media-mobile/);
  assert.match(html, /<figure class="article-media"><img/);
});

test("agrupa fotos consecutivas mantendo links e legendas, sem juntar banners ou atravessar texto", () => {
  const photo = '<figure><a href="/foto/"><img src="/foto.jpg" width="280" height="280"></a><figcaption>Legenda</figcaption></figure>';
  const banner = '<figure><img src="/banner.jpg" width="740" height="300"></figure>';
  const html = prepareArticleHtml(`${banner}${photo}\n${photo}<p>Separação editorial.</p>${photo}`);
  assert.equal((html.match(/class="article-gallery"/g) ?? []).length, 1);
  assert.match(html, /<\/figure><div class="article-gallery">/);
  assert.equal((html.match(/href="\/foto\/"/g) ?? []).length, 3);
  assert.equal((html.match(/<figcaption>Legenda<\/figcaption>/g) ?? []).length, 3);
  assert.match(html, /<\/div>\s*<p>Separação editorial\.<\/p><figure>/);
});

test("separa parágrafos marcados por dupla quebra e mantém links e quebras simples", () => {
  const html = prepareArticleHtml('<p>Primeira ideia <a href="/blog/">com link</a>.<br>\n<br>Segunda ideia.<br>Dado complementar.</p>');
  assert.match(html, /<\/p><p>Segunda ideia\.<br>Dado complementar\.<\/p>/);
  assert.match(html, /href="\/blog\/"/);
  assert.match(html, /Primeira ideia/);
});

test("separa imagens de títulos e parágrafos preservando o texto e o link da mídia", () => {
  const html = prepareArticleHtml('<h3><span><img src="/cinzas.jpg">Tipos de Cinzas</span></h3><p><a href="/produto/"><img src="/produto.jpg"></a></p><p>Texto.</p>');
  assert.match(html, /<figure class="article-media"><img src="\/cinzas.jpg"/);
  assert.match(html, /<h3><span>Tipos de Cinzas<\/span><\/h3>/);
  assert.match(html, /<figure class="article-media"><a href="\/produto\/">/);
  assert.doesNotMatch(html, /<p><a/);
});

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

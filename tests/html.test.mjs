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

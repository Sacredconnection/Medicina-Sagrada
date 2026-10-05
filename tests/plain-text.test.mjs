import assert from "node:assert/strict";
import test from "node:test";
import { plainText } from "../lib/plain-text.ts";
import { plainText as serverPlainText } from "../lib/html.ts";

test("texto leve preserva entidades, espaços e conteúdo do tratamento anterior", () => {
  const samples = [
    "A &amp; B", "&amp;lt;script&amp;gt;", "&amp;#65;", "&eacute; &copy; &#1114112;",
    "<p>A</p><p>B</p>", "A<br>B", "<svg><text>Nome</text></svg>", "<!-- Texto -->Olá",
    "<p><b>Nome</b></p>", '<a href="javascript:x">Texto</a>', "x & y < z > q",
    "<div>texto&nbsp; &quot;nome&quot; &apos;", "A&#xD800;B", "<title>Título</title>A",
    "Rapé Huni Kuin — 20g", "R$ 59,00", "", "<p>  Quebras\n e\t espaços </p>",
  ];
  for (const html of samples) assert.equal(plainText(html), serverPlainText(html), html);
});

test("código e elementos não textuais não aparecem no nome ou na sacola", () => {
  for (const html of [
    "<script>alert(1)</script>Texto", "<script><p>A</p>",
    "<style>css</style>A<textarea>B</textarea>C<option>D</option>E",
    '<img src="x" onerror="alert(1)"><p>Nome seguro</p>',
  ]) {
    assert.equal(plainText(html), serverPlainText(html));
    assert.doesNotMatch(plainText(html), /alert\(|css|onerror/);
  }
});

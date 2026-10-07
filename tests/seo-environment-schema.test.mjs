import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { isDemoContentPath } from "../lib/sitemap-policy.ts";

function load(path, production) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const compiledModule = { exports: {} };
  const require = name => {
    if (["@/lib/config", "./lib/config"].includes(name)) return { isProductionSite: production, config: { siteUrl: "https://medicinasagrada.com.br", siteName: "Medicina Sagrada" } };
    if (name === "@/lib/html") return { plainText: value => value, excerpt: value => value };
    if (name === "@/lib/ethnicity-colors") return { canonicalizeEthnicityNames: value => value };
    if (name === "@/lib/url") return { absoluteUrl: path => new URL(path, "https://medicinasagrada.com.br").toString() };
    if (name === "@/lib/sitemap-policy") return { isDemoContentPath };
    throw new Error(`Unexpected import: ${name}`);
  };
  new Function("require", "module", "exports", source)(require, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}

test("preview metadata and response headers are noindex; official production stays indexable", async () => {
  for (const production of [false, true]) {
    const seo = load("../lib/seo.ts", production);
    const metadata = seo.createMetadata({ title: "Test", description: "Summary", pathname: "/" });
    assert.equal(metadata.robots.index, production);
    const rules = await load("../next.config.ts", production).default.headers();
    assert.equal(rules[0].headers.some(header => header.key === "X-Robots-Tag"), !production);
    assert.equal(seo.createMetadata({ title: "Test", description: "Summary", pathname: "/", noIndex: true }).robots.index, false);
  }
});

test("editorial schema links verified image/publisher without inventing author or guide dates", () => {
  const seo = load("../lib/seo.ts", true);
  const guide = JSON.parse(JSON.stringify(seo.editorialSchema({ pathname: "/aprenda/primeiro-rape/", headline: "Guia", description: "Summary", image: "/assets/aprenda/guias/primeiro-rape/passo-01.webp" })));
  assert.equal(guide.image, "https://medicinasagrada.com.br/assets/aprenda/guias/primeiro-rape/passo-01.webp");
  assert.equal(guide.publisher["@id"], seo.organizationSchema["@id"]);
  assert.equal(guide.isPartOf["@id"], seo.websiteSchema["@id"]);
  assert.ok(!("author" in guide) && !("datePublished" in guide) && !("dateModified" in guide));
  const post = seo.editorialSchema({ pathname: "/rape/", headline: "Rapé", image: "https://cms.example/photo.webp", datePublished: "2023-08-01T12:00:00", dateModified: "2024-09-03T12:00:00" });
  assert.equal(post.image, "https://cms.example/photo.webp");
  assert.equal(post.dateModified, "2024-09-03T12:00:00");
  assert.equal(post.url, "https://medicinasagrada.com.br/rape/");
});

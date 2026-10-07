import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { isDemoContentPath } from "../lib/sitemap-policy.ts";

const source = ts.transpileModule(readFileSync(new URL("../lib/seo.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const compiledModule = { exports: {} };
const require = (name) => {
  if (name === "@/lib/config") return { isProductionSite: true, config: { siteUrl: "https://medicinasagrada.com.br", siteName: "Medicina Sagrada" } };
  if (name === "@/lib/html") return { plainText: value => value, excerpt: value => value };
  if (name === "@/lib/ethnicity-colors") return { canonicalizeEthnicityNames: value => value };
  if (name === "@/lib/url") return { absoluteUrl: path => new URL(path, "https://medicinasagrada.com.br").toString() };
  if (name === "@/lib/sitemap-policy") return { isDemoContentPath };
  throw new Error(`Unexpected import: ${name}`);
};
new Function("require", "module", "exports", source)(require, compiledModule, compiledModule.exports);

test("CMS demo pages are noindex/follow; verified editorial pages and posts remain indexable", () => {
  const content = { type: "page", title: { rendered: "Title" }, excerpt: { rendered: "Summary" }, content: { rendered: "Body" } };
  const metadata = compiledModule.exports.metadataForContent;
  assert.deepEqual(metadata(content, "/sample-page/").robots, { index: false, follow: true });
  for (const path of ["/sobre-nos/", "/atendimento/", "/politica-de-privacidade/"]) assert.equal(metadata(content, path).robots.index, true);
  assert.equal(metadata({ ...content, type: "post" }, "/about/").robots.index, true);
  assert.equal(metadata(content, "/sample-page/").alternates.canonical, "https://medicinasagrada.com.br/sample-page/");
});

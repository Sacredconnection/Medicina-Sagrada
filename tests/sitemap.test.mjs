import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { finalizeSitemap } from "../lib/sitemap-policy.ts";

const source = ts.transpileModule(
  readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;

const wpEntry = (path) => ({ link: `https://medicinasagrada.com.br${path}`, modified: "2024-09-03T12:00:00" });
const fixtures = {
  getAllPages: [wpEntry("/cart/"), wpEntry("/sample-page/"), wpEntry("/rape/"), wpEntry("/blog/")],
  getAllPosts: [wpEntry("/rape/")],
  getAllProducts: [{ slug: "kit-fogo" }],
  getAllProductCategories: [{ count: 1, permalink: "https://medicinasagrada.com.br/product-category/rape/" }],
  getAllPostCategories: [{ count: 1, slug: "cultura" }],
};

function load(failingSource) {
  const loaders = Object.fromEntries(Object.entries(fixtures).map(([name, data]) => [name, async () => {
    if (name === failingSource) throw new Error(`Unavailable: ${name}`);
    return data;
  }]));
  const compiledModule = { exports: {} };
  const require = (name) => {
    if (name === "@/lib/wordpress" || name === "@/lib/woocommerce") return loaders;
    if (name === "@/lib/sitemap-policy") return { finalizeSitemap };
    if (name === "@/lib/learn-content") return { learnGuides: [{ slug: "primeiro-rape" }] };
    if (name === "@/lib/url") return {
      absoluteUrl: (path) => new URL(path, "https://medicinasagrada.com.br").toString(),
      pathnameFromUrl: (url) => new URL(url).pathname,
    };
    throw new Error(`Unexpected import: ${name}`);
  };
  new Function("require", "module", "exports", "console", source)(require, compiledModule, compiledModule.exports, { error() {} });
  return compiledModule.exports.default;
}

test("real sitemap route combines all sources without duplicates or operational/demo URLs", async () => {
  const result = await load()();
  const paths = result.map(item => new URL(item.url).pathname);
  assert.equal(paths.filter(path => path === "/rape/").length, 1);
  assert.ok(!paths.includes("/cart/") && !paths.includes("/sample-page/"));
  for (const path of ["/", "/blog/", "/aprenda/primeiro-rape/", "/product/kit-fogo/", "/product-category/rape/", "/category/cultura/"]) assert.ok(paths.includes(path));
});

test("any source failure rejects instead of publishing a successful truncated sitemap", async () => {
  for (const name of Object.keys(fixtures)) {
    await assert.rejects(load(name)(), new RegExp(`Unavailable: ${name}`));
  }
});

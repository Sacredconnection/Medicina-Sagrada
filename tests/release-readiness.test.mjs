import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { parseTagArchive } from "../lib/archive-path.ts";
import { cmsMediaUrl, cmsLinkUrl, mapCmsUrls } from "../lib/cms-urls.ts";
import { revalidationPath } from "../lib/revalidation.ts";
import { validateReleaseConfig } from "../scripts/release-config.mjs";

const wp = "https://checkout.medicinasagrada.com.br";
test("legacy archives preserve canonical pagination and reject malformed paths", () => {
  assert.deepEqual(parseTagArchive(["kuntanawa", "page", "2"], "tag"), { slug: "kuntanawa", page: 2, basePath: "/tag/kuntanawa/", pathname: "/tag/kuntanawa/page/2/" });
  assert.equal(parseTagArchive(["agua-de-cheiro"], "product-tag").pathname, "/product-tag/agua-de-cheiro/");
  for (const path of [[], ["x", "nested"], ["x", "page", "0"], ["x", "page", "01"], ["x", "page", "1.5"], ["x", "page", "2", "extra"], ["x", "page", "Infinity"]]) assert.equal(parseTagArchive(path, "tag"), null);
});

test("domain migration moves uploads and editorial links, preserving external/payment destinations", () => {
  const image = "https://medicinasagrada.com.br/wp-content/uploads/2026/foto.webp?v=1";
  assert.equal(cmsMediaUrl(image, wp), `${wp}/wp-content/uploads/2026/foto.webp?v=1`);
  assert.equal(cmsMediaUrl("/wp-content/uploads/foto.jpg", wp), `${wp}/wp-content/uploads/foto.jpg`);
  assert.equal(cmsMediaUrl("https://external.example/wp-content/uploads/x.jpg", wp), "https://external.example/wp-content/uploads/x.jpg");
  assert.equal(cmsLinkUrl(`${wp}/product/abc/?x=1#details`, wp), "/product/abc/?x=1#details");
  for (const path of ["/checkout/", "/account/", "/wp-json/", "/wp-admin/"]) assert.equal(cmsLinkUrl(wp + path, wp), wp + path);
  const input = { images: [{ src: image }], content: { rendered: `<a href="${wp}/aprenda/">Ler</a><img src="${image}">` }, prices: { price: "1000" } };
  const before = structuredClone(input), result = mapCmsUrls(input, wp);
  assert.deepEqual(input, before);
  assert.equal(result.images[0].src, `${wp}/wp-content/uploads/2026/foto.webp?v=1`);
  assert.match(result.content.rendered, /href="\/aprenda\/"/);
  assert.deepEqual(result.prices, input.prices);
});

test("revalidation rejects null, remote URLs, traversal and invalid types", () => {
  assert.equal(revalidationPath({ path: "/" }), "/");
  assert.equal(revalidationPath({ type: "product", slug: "test" }), "/product/test/");
  for (const payload of [null, [], 1, {}, { type: "other", slug: "x" }, { path: "https://evil.test" }, { path: "//evil.test" }, { path: "/../admin" }, { path: "/%2e%2e/test" }, { path: "/api/health" }, { path: "/x?token=y" }, { path: 123 }]) assert.equal(revalidationPath(payload), null);
});

test("release gate rejects missing secrets, public secrets and same-origin checkout", () => {
  const template = parseEnv(readFileSync("deploy/production.env.example", "utf8"));
  const valid = { ...template, REVALIDATION_SECRET: "a".repeat(64), RATE_LIMIT_REDIS_URL: "https://redis.example", RATE_LIMIT_REDIS_TOKEN: "private" };
  assert.equal(validateReleaseConfig(valid).filter(c => c.status === "blocked").length, 0);
  for (const env of [template, { ...valid, WOOCOMMERCE_CHECKOUT_URL: "https://medicinasagrada.com.br/checkout/" }, { ...valid, NEXT_PUBLIC_API_KEY: "secret" }, { ...valid, WORDPRESS_API_URL: "http://checkout.medicinasagrada.com.br/wp-json" }]) assert.ok(validateReleaseConfig(env).some(c => c.status === "blocked"));
  assert.doesNotMatch(JSON.stringify(validateReleaseConfig({ ...valid, NEXT_PUBLIC_API_KEY: "do-not-print-this" })), /do-not-print-this/);
});

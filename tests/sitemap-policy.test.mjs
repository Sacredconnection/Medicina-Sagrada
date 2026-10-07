import assert from "node:assert/strict";
import test from "node:test";
import { finalizeSitemap, isDemoContentPath } from "../lib/sitemap-policy.ts";

const entry = (path, values = {}) => ({ url: `https://medicinasagrada.com.br${path}`, ...values });

test("demo policy matches exact paths including query variants, preserving real pages", () => {
  for (const path of ["/sample-page", "/sample-page/", "/sample-page/?preview=1", "/about/", "/dev-page/"]) assert.equal(isDemoContentPath(path), true);
  for (const path of ["/sobre-nos/", "/atendimento/", "/aprenda/", "/product/about/", "/blog/about/"]) assert.equal(isDemoContentPath(path), false);
});

test("sitemap excludes operational and confirmed demo URLs without excluding catalog or editorial", () => {
  const paths = ["/", "/cart/", "/checkout/", "/account/", "/busca/", "/api/reviews/", "/sample-page/", "/affiliate-dashboard/", "/about/", "/product/kit-fogo/", "/product-category/rape/", "/sobre-nos/", "/blog/", "/aprenda/primeiro-rape/"];
  const result = finalizeSitemap(paths.map(path => entry(path)));
  assert.deepEqual(result.map(item => new URL(item.url).pathname), ["/", "/product/kit-fogo/", "/product-category/rape/", "/sobre-nos/", "/blog/", "/aprenda/primeiro-rape/"]);
});

test("duplicate page/post permalinks keep the post data and normalize trailing slash", () => {
  const page = entry("/rape", { lastModified: new Date("2023-01-01"), priority: 0.7 });
  const post = entry("/rape/", { lastModified: new Date("2024-09-03"), priority: 0.7 });
  const result = finalizeSitemap([page, post]);
  assert.equal(result.length, 1);
  assert.equal(result[0].url, post.url);
  assert.deepEqual(result[0].lastModified, post.lastModified);
  assert.equal(page.url.endsWith("/"), false);
});

test("sitemap keeps paginated canonical URLs but drops query and fragment variants", () => {
  const result = finalizeSitemap([entry("/product-category/rape/page/2/"), entry("/product-category/rape/?ordem=menor_preco"), entry("/product/kit-fogo/#avaliacoes")]);
  assert.deepEqual(result.map(item => item.url), ["https://medicinasagrada.com.br/product-category/rape/page/2/"]);
});

import { existsSync, readFileSync } from "node:fs";
import { mkdirSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";

const local = existsSync(".env.local") ? parseEnv(readFileSync(".env.local", "utf8")) : {};
const env = { ...local, ...process.env };
const key = env.WORDPRESS_CONSUMER_KEY;
const secret = env.WORDPRESS_CONSUMER_SECRET;
const base = new URL(env.WORDPRESS_API_URL ?? "https://medicinasagrada.com.br/wp-json");
if (!key || !secret) throw new Error("WooCommerce API credentials are not configured.");
if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash) {
  throw new Error("WORDPRESS_API_URL must be HTTPS and contain no credentials or query.");
}
const authorization = `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;

async function read(path) {
  const response = await fetch(new URL(path.replace(/^\//, ""), `${base.href.replace(/\/$/, "")}/`), {
    headers: { Accept: "application/json", Authorization: authorization, "Cache-Control": "no-store" },
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`WooCommerce read failed with HTTP ${response.status}.`);
  return response.json();
}

const inspectId = process.argv[2];
if (inspectId) {
  const product = await read(`wc/v3/products/${Number(inspectId)}`);
  console.log(JSON.stringify({ id: product.id, name: product.name, sku: product.sku, type: product.type, status: product.status, price: product.price, stock_status: product.stock_status, attributes: product.attributes }, null, 2));
  process.exit(0);
}

console.error("Reading registered WooCommerce attributes...");
const attributes = await read("wc/v3/products/attributes?per_page=100");
console.error(`Found ${attributes.length} registered attributes. Reading published product index...`);
const firstResponse = await fetch(new URL("wc/v3/products?per_page=100&page=1&status=publish&_fields=id,sku,name,status,type,attributes", `${base.href.replace(/\/$/, "")}/`), {
  headers: { Accept: "application/json", Authorization: authorization, "Cache-Control": "no-store" },
  redirect: "error",
  signal: AbortSignal.timeout(20_000),
});
if (!firstResponse.ok) throw new Error(`WooCommerce read failed with HTTP ${firstResponse.status}.`);
const firstPage = await firstResponse.json();
const products = [...firstPage];
const totalPages = Number(firstResponse.headers.get("X-WP-TotalPages") ?? 1);
console.error(`Published catalog has ${totalPages} page(s); fetched page 1.`);
for (let page = 2; page <= totalPages; page += 1) {
  products.push(...await read(`wc/v3/products?per_page=100&page=${page}&status=publish&_fields=id,sku,name,status,type,attributes`));
  console.error(`Fetched published page ${page}.`);
}
const result = {
  attributes: attributes.map(({ id, name, slug, type, order_by, has_archives }) => ({ id, name, slug, type, order_by, has_archives })),
  publishedProductCount: products.length,
  products: products.map(({ id, sku, name, status, type, attributes }) => ({ id, sku, name, status, type, attributes: attributes.map(({ id, name, options, variation, visible }) => ({ id, name, options, variation, visible })) })),
};
mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/woocommerce-intentions-catalog-read.json", `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  registeredAttributeCount: result.attributes.length,
  registeredAttributes: result.attributes,
  publishedProductCount: result.publishedProductCount,
  readSnapshot: "artifacts/woocommerce-intentions-catalog-read.json",
}, null, 2));

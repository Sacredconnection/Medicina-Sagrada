import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";

const local = existsSync(".env.local") ? parseEnv(readFileSync(".env.local", "utf8")) : {};
const env = { ...local, ...process.env };
const key = env.WORDPRESS_CONSUMER_KEY;
const secret = env.WORDPRESS_CONSUMER_SECRET;
const base = new URL(env.WORDPRESS_API_URL ?? "https://medicinasagrada.com.br/wp-json");
if (!key || !secret) throw new Error("WooCommerce API credentials are not configured.");
if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash) throw new Error("WORDPRESS_API_URL must be HTTPS.");
const auth = `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
const reportPath = process.argv[2] ?? "artifacts/intention-import-result.json";
const report = JSON.parse(readFileSync(reportPath, "utf8").replace(/^\uFEFF/, ""));

async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(new URL(path.replace(/^\//, ""), `${base.href.replace(/\/$/, "")}/`), {
    method,
    headers: { Accept: "application/json", Authorization: auth, "Cache-Control": "no-store", ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`WooCommerce ${method} ${path} failed with HTTP ${response.status}: ${data?.message ?? "no response detail"}`);
  return data;
}

const rollback = { startedAt: new Date().toISOString(), source: reportPath, restoredProducts: [], removedTerms: [], removedAttributes: [] };
for (const product of report.products.filter((item) => item.changed)) {
  const current = await request(`wc/v3/products/${product.id}`);
  if (JSON.stringify(current.attributes) === JSON.stringify(product.previousAttributes)) {
    rollback.restoredProducts.push({ id: product.id, unchanged: true });
    continue;
  }
  await request(`wc/v3/products/${product.id}`, { method: "PUT", body: { attributes: product.previousAttributes } });
  const restored = await request(`wc/v3/products/${product.id}`);
  if (JSON.stringify(restored.attributes) !== JSON.stringify(product.previousAttributes)) throw new Error(`Attribute rollback verification failed for product ${product.id}.`);
  rollback.restoredProducts.push({ id: product.id, restored: true });
}

for (const entry of [...report.createdDefinitionsAndTerms].reverse()) {
  if (entry.kind === "created-term") {
    await request(`wc/v3/products/attributes/${entry.attributeId}/terms/${entry.id}?force=true`, { method: "DELETE" });
    rollback.removedTerms.push(entry.id);
  }
  if (entry.kind === "created-attribute") {
    await request(`wc/v3/products/attributes/${entry.id}?force=true`, { method: "DELETE" });
    rollback.removedAttributes.push(entry.id);
  }
}
rollback.completedAt = new Date().toISOString();
writeFileSync("artifacts/intention-import-rollback.json", `${JSON.stringify(rollback, null, 2)}\n`);
console.log(JSON.stringify({
  success: true,
  restoredProducts: rollback.restoredProducts.length,
  removedTerms: rollback.removedTerms.length,
  removedAttributes: rollback.removedAttributes.length,
  log: "artifacts/intention-import-rollback.json",
}, null, 2));

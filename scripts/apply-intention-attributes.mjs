import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
const auth = `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
const translation = new Map([
  ["Grounding & Centering", "Aterramento e presença"],
  ["Focus & Clarity", "Foco e clareza"],
  ["Calm & Introspection", "Calma e introspecção"],
  ["Energy & Renewal", "Energia e renovação"],
  ["Cleansing & Refreshing", "Limpeza e refrescância"],
  ["Prayer & Ceremony", "Oração e cerimônia"],
  ["Heart & Connection", "Coração e conexão"],
]);
const intentionNames = [...translation.values()];
const specs = [
  { slug: "intencao-principal", name: "Intenção principal" },
  { slug: "intencoes-secundarias", name: "Intenções secundárias" },
];
const readJson = (path) => JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
const audit = readJson("artifacts/intention-join-audit.json");
const requestedLimit = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.slice("--limit=".length) ?? 0);
const candidates = audit.Rows.filter((row) => row.Decision === "Ready for intention attributes").slice(0, requestedLimit > 0 ? requestedLimit : undefined);
if (!candidates.length) throw new Error("No source-reviewed exact-SKU candidates are ready.");
for (const row of candidates) {
  if (!row.WooCommerceIDBySku || row.MatchCount !== 1 || !/^RA/.test(row.SKU) || row.WooCommerceSKU !== `MS${row.SKU.slice(2)}` || !translation.has(row.PrimaryIntention) || !row.Source || (!row.SourcePage && !row.SourceURL)) {
    throw new Error(`Readiness validation failed for workbook row ${row.WorkbookRow}.`);
  }
  if (row.Secondary1 && !translation.has(row.Secondary1)) throw new Error(`Unknown secondary intention for row ${row.WorkbookRow}.`);
  if (row.Secondary2 && !translation.has(row.Secondary2)) throw new Error(`Unknown secondary intention for row ${row.WorkbookRow}.`);
}

async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(new URL(path.replace(/^\//, ""), `${base.href.replace(/\/$/, "")}/`), {
    method,
    headers: { Accept: "application/json", Authorization: auth, "Cache-Control": "no-cache, no-store", Pragma: "no-cache", ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`WooCommerce ${method} ${path} failed with HTTP ${response.status}: ${data?.message ?? "no response detail"}`);
  return data;
}

console.log(`Preparing ${candidates.length} exact-SKU, high-confidence, source-backed product updates.`);
const attributes = await request("wc/v3/products/attributes?per_page=100");
const attributeChanges = [];
mkdirSync("artifacts", { recursive: true });
const report = {
  startedAt: new Date().toISOString(),
  mode: "apply",
  candidateCount: candidates.length,
  createdDefinitionsAndTerms: attributeChanges,
  products: [],
  results: [],
};
const saveBeforeLog = () => writeFileSync("artifacts/intention-import-before.json", `${JSON.stringify(report, null, 2)}\n`);
saveBeforeLog();
for (const spec of specs) {
  const matches = attributes.filter((item) => item.slug === `pa_${spec.slug}` || item.name.toLocaleLowerCase("pt-BR") === spec.name.toLocaleLowerCase("pt-BR"));
  if (matches.length > 1) throw new Error(`Multiple global attributes match ${spec.name}; no writes performed.`);
  let attribute = matches[0];
  if (!attribute) {
    attribute = await request("wc/v3/products/attributes", { method: "POST", body: { name: spec.name, slug: spec.slug, type: "select", order_by: "menu_order", has_archives: false } });
    attributeChanges.push({ kind: "created-attribute", id: attribute.id, slug: attribute.slug, name: attribute.name });
    saveBeforeLog();
  }
  spec.id = attribute.id;
  const terms = await request(`wc/v3/products/attributes/${attribute.id}/terms?per_page=100`);
  for (const name of intentionNames) {
    const matchesForTerm = terms.filter((term) => term.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"));
    if (matchesForTerm.length > 1) throw new Error(`Duplicate term ${name} in ${spec.name}; no product updates performed.`);
    if (!matchesForTerm.length) {
      const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const term = await request(`wc/v3/products/attributes/${attribute.id}/terms`, { method: "POST", body: { name, slug } });
      attributeChanges.push({ kind: "created-term", attributeId: attribute.id, id: term.id, name: term.name, slug: term.slug });
      saveBeforeLog();
    }
  }
}

const products = [];
for (const row of candidates) {
  const id = Number(row.WooCommerceIDBySku);
  const product = await request(`wc/v3/products/${id}`);
  if (product.id !== id || product.sku !== row.WooCommerceSKU || product.status !== "publish") {
    throw new Error(`Product validation failed for ID ${id}; stopping before product updates.`);
  }
  const wanted = [
    { id: specs[0].id, name: specs[0].name, options: [translation.get(row.PrimaryIntention)], visible: true, variation: false },
    { id: specs[1].id, name: specs[1].name, options: [row.Secondary1, row.Secondary2].filter(Boolean).map((name) => translation.get(name)), visible: true, variation: false },
  ];
  const proposed = [...product.attributes];
  for (const item of wanted) {
    const currentIndex = proposed.findIndex((attribute) => Number(attribute.id) === item.id);
    if (currentIndex === -1) proposed.push(item);
    else proposed[currentIndex] = { ...proposed[currentIndex], ...item };
  }
  products.push({
    id,
    name: product.name,
    sku: product.sku,
    type: product.type,
    status: product.status,
    price: product.price,
    stockStatus: product.stock_status,
    spreadsheetSku: row.SKU,
    source: row.Source,
    sourcePage: row.SourcePage,
    sourceUrl: row.SourceURL,
    previousAttributes: product.attributes,
    proposedAttributes: proposed,
    changed: JSON.stringify(product.attributes) !== JSON.stringify(proposed),
  });
}

report.products = products;
saveBeforeLog();
console.log(`Registered/verified ${specs.length} global attributes and their terms; ${products.filter((product) => product.changed).length} product(s) need new intention values.`);

for (const entry of products.filter((product) => product.changed)) {
  const updated = await request(`wc/v3/products/${entry.id}`, { method: "PUT", body: { attributes: entry.proposedAttributes } });
  const reread = await request(`wc/v3/products/${entry.id}?context=edit&intentions_check=${Date.now()}`);
  const verified = entry.proposedAttributes.filter((item) => specs.some((spec) => spec.id === item.id)).every((expected) => {
    const actual = reread.attributes.find((item) => Number(item.id) === expected.id);
    return expected && actual && actual.variation === false && JSON.stringify([...actual.options].sort()) === JSON.stringify([...expected.options].sort());
  });
  if (!verified || updated.id !== entry.id || reread.sku !== entry.sku || reread.type !== entry.type || reread.status !== entry.status || reread.price !== entry.price || reread.stock_status !== entry.stockStatus) {
    report.results.push({
      id: entry.id,
      ok: false,
      message: "Post-write verification failed.",
      updateResponseAttributes: updated.attributes,
      rereadAttributes: reread.attributes,
      expectedIntentionAttributes: entry.proposedAttributes.filter((item) => specs.some((spec) => spec.id === item.id)),
      preservedProductState: { sku: reread.sku, type: reread.type, status: reread.status, price: reread.price, stockStatus: reread.stock_status },
    });
    writeFileSync("artifacts/intention-import-result.json", `${JSON.stringify(report, null, 2)}\n`);
    throw new Error(`Post-write verification failed for WooCommerce product ${entry.id}.`);
  }
  report.results.push({ id: entry.id, sku: entry.sku, ok: true });
  console.log(`Verified intention attributes on product ID ${entry.id}.`);
}

report.completedAt = new Date().toISOString();
report.success = report.results.every((result) => result.ok);
writeFileSync("artifacts/intention-import-result.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  success: report.success,
  candidateCount: report.candidateCount,
  productWrites: report.results.length,
  verified: report.results.filter((result) => result.ok).length,
  attributeIds: specs.map(({ id, name }) => ({ id, name })),
  log: "artifacts/intention-import-result.json",
}, null, 2));

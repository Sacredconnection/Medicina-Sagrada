import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { validateReleaseConfig } from "./release-config.mjs";

const args = process.argv.slice(2);
const option = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const envFile = option("--env") ?? ".env.release.local";
// Deliberately don't merge .env.local or shell values: validate the exact file
// that will be imported. Never print values, tokens, cookies or response bodies.
const env = parseEnv(readFileSync(envFile, "utf8"));
const checks = validateReleaseConfig(env);
const record = (id, ok, message) => checks.push({ id, status: ok ? "ok" : "blocked", message });
async function probe(id, url, validate) {
  try {
    const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(15_000), headers: { Accept: "application/json" } });
    record(id, response.ok && await validate(response), `Resposta HTTP ${response.status}; formato e conteudo conferidos.`);
  } catch { record(id, false, "Falha de conexao, redirecionamento inesperado ou resposta invalida."); }
}
if (args.includes("--online")) {
  await probe("wordpress-origin", `${env.WORDPRESS_API_URL}/`, async r => {
    const data = await r.json();
    return [data.url, data.home].every(value => typeof value === "string" && new URL(value).origin === new URL(env.WORDPRESS_SITE_URL).origin);
  });
  await probe("wordpress-api", `${env.WORDPRESS_API_URL}/wp/v2/posts?per_page=1`, async r => Array.isArray(await r.json()));
  await probe("catalog", `${env.WOOCOMMERCE_STORE_API_URL}/products?per_page=1`, async r => {
    const data = await r.json(); return Array.isArray(data) && !!data[0]?.id && !!data[0]?.prices;
  });
  await probe("wordpress-plugin", `${env.WORDPRESS_API_URL}/ms-headless/v1/status`, async r => {
    const data = await r.json();
    record("revalidation-enabled", data.revalidation === true, "O WordPress precisa ter MS_HEADLESS_URL e MS_REVALIDATION_SECRET configurados.");
    return data.cart_completion === true;
  });
  try {
    const response = await fetch(env.WOOCOMMERCE_CHECKOUT_URL, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
    const location = response.headers.get("location");
    const destination = location ? new URL(location, env.WOOCOMMERCE_CHECKOUT_URL) : new URL(env.WOOCOMMERCE_CHECKOUT_URL);
    record("checkout-origin", (response.ok || (response.status >= 300 && response.status < 400 && !!location)) && destination.origin === new URL(env.WORDPRESS_SITE_URL).origin, "Checkout deve responder ou redirecionar dentro da origem WordPress; sacola vazia pode redirecionar para /cart/.");
    await response.body?.cancel();
  } catch { record("checkout-origin", false, "Checkout indisponivel."); }
  if (env.RATE_LIMIT_REDIS_URL && env.RATE_LIMIT_REDIS_TOKEN) {
    try {
      const response = await fetch(env.RATE_LIMIT_REDIS_URL, { method: "POST", redirect: "error", signal: AbortSignal.timeout(10_000), headers: { Authorization: `Bearer ${env.RATE_LIMIT_REDIS_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(["PING"]) });
      record("redis", response.ok && (await response.json()).result === "PONG", "Conexao Redis verificada com PING, sem dados pessoais.");
    } catch { record("redis", false, "Redis indisponivel."); }
  }
}
const frontend = option("--frontend");
if (frontend) {
  const base = new URL(frontend);
  if (base.username || base.password || !/^https?:$/.test(base.protocol)) throw new Error("Frontend invalido.");
  await probe("frontend-health", new URL("/api/health/", base), async r => (await r.json()).status === "ok");
  await probe("frontend-sitemap", new URL("/sitemap.xml", base), async r => /<urlset\b/.test(await r.text()));
  if (args.includes("--revalidate")) {
    try {
      const response = await fetch(new URL("/api/revalidate/", base), { method: "POST", redirect: "error", signal: AbortSignal.timeout(15_000), headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.REVALIDATION_SECRET}` }, body: JSON.stringify({ path: "/" }) });
      record("revalidation", response.ok && (await response.json()).revalidated === true, "Revalidacao autenticada testada. Isso nao comprova entrega originada no WordPress.");
    } catch { record("revalidation", false, "Revalidacao falhou; confira segredo e acesso ao frontend."); }
  }
}
const report = { at: new Date().toISOString(), ready: !checks.some(check => check.status === "blocked"), onlineChecked: args.includes("--online"), checks };
mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/release-check.json", JSON.stringify(report, null, 2));
for (const check of checks) console.log(`${check.status.toUpperCase()} ${check.id}: ${check.message}`);
console.log("Relatorio sem segredos: artifacts/release-check.json");
process.exitCode = report.ready ? 0 : 1;

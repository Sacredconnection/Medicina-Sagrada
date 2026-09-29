import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { lookup } from "node:dns/promises";
import { createConnection } from "node:net";
import { randomUUID } from "node:crypto";
import { parseEnv } from "node:util";

// Read-only network check. Never print credentials, cookies, cart tokens or bodies.
const local = existsSync(".env.local") ? parseEnv(readFileSync(".env.local", "utf8")) : {};
for (const [key, value] of Object.entries(local)) {
  if (process.env[key] === undefined) process.env[key] = value;
}
const { config } = await import("../lib/config.ts");
const origins = [config.wordpressSiteUrl, config.wordpressApiUrl, config.wooStoreApiUrl];
for (const origin of origins) {
  const url = new URL(origin);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error("As URLs do WordPress devem usar HTTP(S), sem credenciais, query ou fragmento.");
  }
}

const errorCode = error => error?.cause?.code ?? error?.code ?? error?.name ?? "UNKNOWN";
async function checkHost(origin) {
  const url = new URL(origin);
  const port = Number(url.port || (url.protocol === "https:" ? 443 : 80));
  const result = { host: url.hostname, port, addresses: [], dns: false, tcp: false };
  try {
    result.addresses = await lookup(url.hostname, { all: true });
    result.dns = true;
  } catch (error) {
    return { ...result, error: errorCode(error) };
  }
  const startedAt = performance.now();
  return new Promise(resolve => {
    const socket = createConnection({ host: url.hostname, port });
    let finished = false;
    const finish = error => {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve({ ...result, tcp: !error, durationMs: Math.round(performance.now() - startedAt), ...(error ? { error } : {}) });
    };
    socket.setTimeout(10_000, () => finish("TCP_TIMEOUT"));
    socket.once("connect", () => finish());
    socket.once("error", error => finish(errorCode(error)));
  });
}

const checks = [
  ["wordpress", `${config.wordpressApiUrl}/wp/v2/pages?per_page=1`, Array.isArray],
  ["products", `${config.wooStoreApiUrl}/products?per_page=1`, Array.isArray],
  ["categories", `${config.wooStoreApiUrl}/products/categories?per_page=1`, Array.isArray],
  ["companionPlugin", `${config.wordpressApiUrl}/ms-headless/v1/status`, data => typeof data?.cart_completion === "boolean"],
  ["cart", `${config.wooStoreApiUrl}/cart?_ms_cart=${randomUUID()}`, data => Array.isArray(data?.items) && Boolean(data?.totals)],
];
const hosts = await Promise.all([...new Set(origins.map(origin => new URL(origin).origin))].map(checkHost));
const endpoints = [];
// Sequential requests avoid a burst of diagnostic traffic to WordPress.
for (const [name, url, validate] of checks) {
  const target = new URL(url);
  const port = Number(target.port || (target.protocol === "https:" ? 443 : 80));
  const host = hosts.find(item => item.host === target.hostname && item.port === port);
  if (!host?.tcp) {
    endpoints.push({ name, endpoint: target.pathname, ok: false, skipped: "Conexão TCP indisponível; HTTP e TLS não foram alcançados." });
    continue;
  }
  const startedAt = performance.now();
  let status = null;
  try {
    const response = await fetch(url, { headers: { Accept: "application/json", "Cache-Control": "no-store" }, redirect: "error", signal: AbortSignal.timeout(15_000) });
    status = response.status;
    const data = await response.json().catch(() => null);
    const cached = /hit/i.test(response.headers.get("x-litespeed-cache") ?? "")
      || response.headers.get("cf-cache-status") === "HIT" || Number(response.headers.get("age") ?? 0) > 0;
    const session = Boolean(response.headers.get("cart-token"));
    endpoints.push({ name, endpoint: target.pathname, status, ok: response.ok && validate(data) && (name !== "cart" || (session && !cached)),
      durationMs: Math.round(performance.now() - startedAt),
      ...(name === "cart" ? { hasCartToken: session, cached } : {}),
      ...(name === "companionPlugin" && response.ok ? { cartCompletion: data?.cart_completion === true, revalidation: data?.revalidation === true } : {}),
    });
  } catch (error) {
    endpoints.push({ name, endpoint: target.pathname, ok: false, status, error: errorCode(error), durationMs: Math.round(performance.now() - startedAt) });
  }
}
const report = { checkedAt: new Date().toISOString(), healthy: endpoints.every(item => item.ok), hosts, endpoints };
mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/connection-report.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
console.log("Relatório salvo em artifacts/connection-report.json. Nenhum pedido, pagamento ou ajuste remoto foi enviado.");
if (!report.healthy) process.exitCode = 1;

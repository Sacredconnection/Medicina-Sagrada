import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import test from "node:test";
import ts from "typescript";

// Exercise the production diagnostics with controlled HTTP responses.
function diagnostics(fetch, secret = "s".repeat(32)) {
  const config = {
    wordpressApiUrl: "https://cms.example/wp-json",
    wooStoreApiUrl: "https://cms.example/wp-json/wc/store/v1",
    siteUrl: "https://shop.example",
    wooCheckoutUrl: "https://cms.example/checkout/",
  };
  const modules = new Map();
  function load(name) {
    if (name === "@/lib/config") return { config };
    if (name === "node:crypto") return { randomUUID };
    if (modules.has(name)) return modules.get(name);
    const file = name.replace("@/lib/", "");
    const source = ts.transpileModule(readFileSync(new URL(`../lib/${file}.ts`, import.meta.url), "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText;
    const mod = { exports: {} };
    new Function("require", "module", "exports", "fetch", "process", source)(load, mod, mod.exports, fetch, { env: { REVALIDATION_SECRET: secret } });
    modules.set(name, mod.exports);
    return mod.exports;
  }
  return { ...load("@/lib/diagnostics"), ...load("@/lib/commerce-diagnostics") };
}

const json = (data, headers = {}) => Response.json(data, { headers });
const cart = { items: [], totals: {}, payment_methods: ["woo-pagarme-payments-pix"] };
const bridge = { cart_completion: true, revalidation: true };
const healthy = async url => url.includes("/cart?") ? json(cart, { "Cart-Token": "private-test-token" }) : json(bridge);

test("timeout preserva estado remoto desconhecido e mede o tempo real", async () => {
  const client = diagnostics(async () => {
    await new Promise(resolve => setTimeout(resolve, 20));
    throw new DOMException("Timed out", "TimeoutError");
  });
  const content = await client.runContentDiagnostic();
  assert.equal(content.healthy, false);
  assert.equal(content.wordpress.status, null);
  assert.ok(content.wordpress.durationMs >= 15);
  assert.match(content.wordpress.message, /10 segundos/);
  const commerce = await client.runCommerceDiagnostic();
  assert.equal(commerce.companionPlugin, null);
  assert.equal(commerce.pagarme, null);
  assert.equal(commerce.revalidation, null);
  assert.equal(commerce.infrastructureReady, false);
});

test("HTTP 200 com HTML ou objeto inesperado não confirma catálogo", async () => {
  for (const response of [() => new Response("<html>Erro da hospedagem</html>"), () => json({ error: "offline" }), () => json([{}])]) {
    const result = await diagnostics(async () => response()).runContentDiagnostic();
    assert.equal(result.healthy, false);
    assert.equal(result.wordpress.status, 200);
  }
});

test("coleções válidas são reconhecidas e somente amostras públicas são expostas", async () => {
  const result = await diagnostics(async url => url.includes("/pages?")
    ? json([{ id: 1, slug: "sobre", title: { rendered: "Sobre" }, privateField: "omit" }])
    : json([{ id: 2, slug: "colar", name: "Colar", privateField: "omit" }])).runContentDiagnostic();
  assert.equal(result.healthy, true);
  assert.deepEqual(result.woocommerce.sample, { id: 2, slug: "colar", name: "Colar" });
});

test("conexão comercial válida não é tratada como pagamento homologado", async () => {
  const result = await diagnostics(healthy).runCommerceDiagnostic();
  assert.equal(result.infrastructureReady, true);
  assert.equal(result.revalidation, true);
  assert.equal(result.paymentTest, "pending-manual-validation");
  assert.equal(JSON.stringify(result).includes("private-test-token"), false);
});

test("carrinho em cache nunca é marcado como pronto", async () => {
  for (const headers of [{ "X-LiteSpeed-Cache": "hit" }, { "CF-Cache-Status": "HIT" }, { Age: "60" }]) {
    const result = await diagnostics(async url => url.includes("/cart?")
      ? json(cart, { "Cart-Token": "test", ...headers }) : json(bridge)).runCommerceDiagnostic();
    assert.equal(result.cart, false);
    assert.equal(result.infrastructureReady, false);
  }
});

test("respostas incompletas e payment_methods inválido não quebram diagnóstico", async () => {
  for (const data of [{}, { ...cart, payment_methods: {} }, { ...cart, payment_methods: [4] }]) {
    const result = await diagnostics(async () => json(data, { "Cart-Token": "test" })).runCommerceDiagnostic();
    assert.equal(result.cart, false);
    assert.equal(result.companionPlugin, null);
  }
});

test("404 do plugin é reportado sem afirmar que está desinstalado", async () => {
  const result = await diagnostics(async url => url.includes("/cart?")
    ? healthy(url) : new Response(null, { status: 404 })).runCommerceDiagnostic();
  assert.equal(result.cart, true);
  assert.equal(result.companionPlugin, null);
  assert.equal(result.checks.bridge.status, 404);
});

test("configuração ausente e recurso desabilitado são distintos de falha de conexão", async () => {
  const result = await diagnostics(async url => url.includes("/cart?")
    ? healthy(url) : json({ cart_completion: false, revalidation: false }), "").runCommerceDiagnostic();
  assert.equal(result.companionPlugin, false);
  assert.equal(result.revalidation, false);
  assert.equal(result.localRevalidation, false);
  assert.equal(result.checks.bridge.ok, true);
});

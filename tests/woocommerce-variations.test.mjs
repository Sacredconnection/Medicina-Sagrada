import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Run the real loader with a controlled Store API, without a Next.js server.
const source = ts.transpileModule(
  readFileSync(new URL("../lib/woocommerce.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;

function loader(wooFetch) {
  const compiledModule = { exports: {} };
  const require = (name) => {
    if (name === "@/lib/api") return { wooFetch };
    if (name === "@/lib/catalog-query") return {};
    throw new Error(`Unexpected import: ${name}`);
  };
  new Function("require", "module", "exports", source)(require, compiledModule, compiledModule.exports);
  return compiledModule.exports.getProductVariations;
}

const product = {
  type: "variable",
  slug: "rape-de-teste",
  variations: [{ id: 10 }, { id: 20 }, { id: 50 }],
};
const variation = (id) => ({ id, type: "variation", prices: { price: String(id * 100) } });

test("consulta o preço exato de cada peso mesmo com timeout configurado", async () => {
  const calls = [];
  const getVariations = loader(async (path, query, tags, timeout) => {
    calls.push({ path, timeout });
    return variation(Number(path.split("/")[1]));
  });
  const result = await getVariations(product, { timeoutMs: 15_000 });
  assert.deepEqual(calls, [10, 20, 50].map((id) => ({ path: `products/${id}`, timeout: 15_000 })));
  assert.deepEqual(result.map(({ prices }) => prices.price), ["1000", "2000", "5000"]);
});

test("preserva os preços confirmados quando outro peso falha", async () => {
  const getVariations = loader(async (path) => {
    const id = Number(path.split("/")[1]);
    if (id === 20) throw new Error("Timeout");
    return variation(id);
  });
  assert.deepEqual(
    (await getVariations(product, { timeoutMs: 15_000 })).map(({ id }) => id),
    [10, 50],
  );
});

test("rejeita produto pai ou ID incorreto para não exibir preço de outro peso", async () => {
  const getVariations = loader(async (path) => {
    if (path === "products/10") return { ...variation(10), type: "variable" };
    if (path === "products/20") return variation(999);
    return variation(50);
  });
  assert.deepEqual((await getVariations(product)).map(({ id }) => id), [50]);
});

test("sinaliza falha total quando a confirmação é obrigatória", async () => {
  const getVariations = loader(async () => { throw new Error("Offline"); });
  await assert.rejects(getVariations(product, { requireResponse: true, timeoutMs: 15_000 }));
  assert.deepEqual(await getVariations(product, { timeoutMs: 15_000 }), []);
});

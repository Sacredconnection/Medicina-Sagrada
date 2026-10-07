import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function siteUrl(overrides) {
  const env = { ...process.env };
  for (const key of ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"]) delete env[key];
  return execFileSync(process.execPath, ["--input-type=module", "-e", "import { config } from './lib/config.ts'; process.stdout.write(config.siteUrl)"], {
    env: { ...env, ...overrides }, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
  });
}

test("URL explícita tem prioridade; Vercel não usa localhost sem configuração", () => {
  assert.equal(siteUrl({}), "http://localhost:3000");
  assert.equal(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "medicina-sagrada.vercel.app", VERCEL_URL: "preview.vercel.app" }), "https://medicina-sagrada.vercel.app");
  assert.equal(siteUrl({ VERCEL_URL: "preview.vercel.app" }), "https://preview.vercel.app");
  assert.equal(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://medicinasagrada.com.br/", VERCEL_PROJECT_PRODUCTION_URL: "medicina-sagrada.vercel.app" }), "https://medicinasagrada.com.br");
});

test("corrige a URL legada da conta sem alterar outra origem configurada", () => {
  const resolve = value => execFileSync(process.execPath, ["--input-type=module", "-e", "import { config } from './lib/config.ts'; process.stdout.write(config.wooAccountUrl)"], { env: { ...process.env, WORDPRESS_SITE_URL: "https://medicinasagrada.com.br", WOOCOMMERCE_ACCOUNT_URL: value }, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  assert.equal(resolve("https://medicinasagrada.com.br/my-account/"), "https://medicinasagrada.com.br/account/");
  assert.equal(resolve("https://conta.example/my-account/"), "https://conta.example/my-account/");
});

test("only the official production origin is indexable, even when preview uses its canonical", () => {
  const resolve = overrides => {
    const env = { ...process.env };
    for (const key of ["NODE_ENV", "NEXT_PUBLIC_SITE_URL", "VERCEL_ENV", "VERCEL_URL", "VERCEL_PROJECT_PRODUCTION_URL"]) delete env[key];
    return execFileSync(process.execPath, ["--input-type=module", "-e", "import { isProductionSite } from './lib/config.ts'; process.stdout.write(String(isProductionSite))"], { env: { ...env, ...overrides }, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  };
  const production = { NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://medicinasagrada.com.br/" };
  assert.equal(resolve(production), "true");
  assert.equal(resolve({ ...production, VERCEL_ENV: "production" }), "true");
  assert.equal(resolve({ ...production, VERCEL_ENV: "preview" }), "false");
  assert.equal(resolve({ ...production, NODE_ENV: "development" }), "false");
  assert.equal(resolve({ ...production, NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }), "false");
});

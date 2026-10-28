import test from "node:test";
import assert from "node:assert/strict";
import { consumeLimit, rateIdentity, limitRequest } from "../lib/rate-limit.ts";

test("limite recusa excesso e libera novamente ao expirar", () => {
  assert.equal(consumeLimit("test-window", 2, 1000), true);
  assert.equal(consumeLimit("test-window", 2, 1000), true);
  assert.equal(consumeLimit("test-window", 2, 1000), false);
  assert.equal(consumeLimit("test-window", 2, 61000), true);
});

test("identidade ignora IP não confiável e não expõe token da sessão", () => {
  const old = { VERCEL: process.env.VERCEL, RATE_LIMIT_IP_HEADER: process.env.RATE_LIMIT_IP_HEADER };
  delete process.env.VERCEL; delete process.env.RATE_LIMIT_IP_HEADER;
  try {
    const id = rateIdentity(new Request("http://localhost", { headers: { "x-forwarded-for": "1.2.3.4", Cookie: "ms_cart=secret-token" } }));
    assert.equal(id.ip, "unknown"); assert.equal(id.session.length, 64);
    assert.notEqual(id.session, "secret-token");
  } finally { for (const [key,value] of Object.entries(old)) { if(value === undefined) delete process.env[key]; else process.env[key]=value; } }
});

test("excesso por sessão retorna 429 e Retry-After sem chamar WooCommerce", async () => {
  const request = new Request("http://localhost", { headers: { Cookie: "ms_cart=limit-test" } });
  let response;
  for (let i=0;i<11;i++) response = await limitRequest(request, "checkout");
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
});

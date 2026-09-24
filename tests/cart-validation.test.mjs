import assert from "node:assert/strict";
import test from "node:test";
import { CartInputError, isSameOrigin, parseCartAction, readCartBody } from "../lib/cart-validation.ts";

test("aceita itens mas nunca preços fornecidos pelo navegador", () => {
  assert.deepEqual(parseCartAction({ action: "add", id: 123, quantity: 2, price: 1, total: 1 }), { action: "add", id: 123, quantity: 2 });
});

test("bloqueia quantidades inválidas, endpoints arbitrários e chaves malformadas", () => {
  for (const quantity of [-1, 0, 1.2, "2", 10000, null]) assert.throws(() => parseCartAction({ action: "add", id: 1, quantity }), CartInputError);
  for (const input of [null, [], { action: "checkout" }, { action: "add", id: "1" }, { action: "remove", key: "../../checkout" }, { action: "apply-coupon", code: " " }]) assert.throws(() => parseCartAction(input), CartInputError);
});

test("mantém apenas atributos validados de uma variação", () => {
  assert.deepEqual(parseCartAction({ action: "add", id: 1, variation: [{ attribute: "pa_cor", value: "azul", price: 1 }] }), { action: "add", id: 1, quantity: 1, variation: [{ attribute: "pa_cor", value: "azul" }] });
  assert.throws(() => parseCartAction({ action: "add", id: 1, variation: [{ attribute: "pa_cor", value: "" }] }), CartInputError);
});

test("bloqueia CSRF, origem nula e requisições cross-site", () => {
  const request = (headers) => new Request("https://loja.example/api/cart/", { headers });
  assert.equal(isSameOrigin(request({ origin: "https://loja.example" }), "https://loja.example"), true);
  assert.equal(isSameOrigin(request({ origin: "https://evil.example" }), "https://loja.example"), false);
  assert.equal(isSameOrigin(request({ origin: "https://loja.example", "sec-fetch-site": "cross-site" }), "https://loja.example"), false);
  assert.equal(isSameOrigin(request({}), "https://loja.example"), false);
});

test("limita o corpo mesmo sem Content-Length", async () => {
  const request = (body, contentType = "application/json") => new Request("http://localhost/api/cart/", { method: "POST", headers: { "Content-Type": contentType }, body });
  assert.deepEqual(await readCartBody(request('{"action":"add","id":1}')), { action: "add", id: 1 });
  await assert.rejects(readCartBody(request("x".repeat(9000))), CartInputError);
  await assert.rejects(readCartBody(request("{")), CartInputError);
  await assert.rejects(readCartBody(request("{}", "text/plain")), CartInputError);
});

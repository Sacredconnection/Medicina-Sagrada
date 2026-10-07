import assert from "node:assert/strict";
import test from "node:test";
import { safeCheckoutDestination } from "../lib/checkout-destination.ts";

const checkout = "https://medicinasagrada.com.br/checkout/";

test("preserves the configured checkout and session query", () => {
  const url = `${checkout}?session=cart-token&lang=pt`;
  assert.equal(safeCheckoutDestination(url, checkout), url);
});

test("rejects foreign origins, unsafe schemes, credentials, wrong paths and invalid responses", () => {
  for (const value of [
    undefined, null, {}, "/checkout/?session=token", "javascript:alert(1)",
    "https://evil.example/checkout/?session=token",
    "https://medicinasagrada.com.br.evil.example/checkout/?session=token",
    "http://medicinasagrada.com.br/checkout/?session=token",
    "https://user:password@medicinasagrada.com.br/checkout/?session=token",
    "https://medicinasagrada.com.br/account/?session=token",
    `${checkout}?session=token#external`, checkout, `${checkout}?session=`,
  ]) assert.throws(() => safeCheckoutDestination(value, checkout));
});

test("HTTP is only accepted for explicitly enabled local development", () => {
  const local = "http://127.0.0.1:4010/checkout/";
  const url = `${local}?session=token`;
  assert.throws(() => safeCheckoutDestination(url, local));
  assert.equal(safeCheckoutDestination(url, local, { allowLocalHttp: true }), url);
  assert.throws(() => safeCheckoutDestination(
    "http://evil.example/checkout/?session=token", "http://evil.example/checkout/", { allowLocalHttp: true },
  ));
});

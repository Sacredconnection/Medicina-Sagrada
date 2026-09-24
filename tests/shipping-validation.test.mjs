import assert from "node:assert/strict";
import test from "node:test";
import { parseShippingInput } from "../lib/shipping-validation.ts";

test("frete valida CEP, produto e quantidade sem aceitar preço ou dimensões", () => {
  assert.deepEqual(parseShippingInput({ productId: 6374, quantity: 2, postcode: "01310-100", price: 0, weight: 0 }), { productId: 6374, quantity: 2, postcode: "01310100" });
  for (const postcode of ["", "00000000", "11111111", "0131010", "013101000", "xx01310100", null]) assert.throws(() => parseShippingInput({ productId: 1, quantity: 1, postcode }));
  for (const quantity of [0, -1, 1.5, 10000, "1", null]) assert.throws(() => parseShippingInput({ productId: 1, quantity, postcode: "01310100" }));
  for (const productId of [0, -1, 1.5, "1", undefined]) assert.throws(() => parseShippingInput({ productId, quantity: 1, postcode: "01310100" }));
});

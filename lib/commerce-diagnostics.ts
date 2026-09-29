import { config } from "@/lib/config";
import { diagnosticRequest } from "@/lib/diagnostic-request";
import { randomUUID } from "node:crypto";

type CartDiagnostic = { items: unknown[]; totals: object; payment_methods: string[] };
type BridgeDiagnostic = { cart_completion: boolean; revalidation: boolean };

export async function runCommerceDiagnostic() {
  const [store, bridge] = await Promise.all([
    diagnosticRequest(
      `${config.wooStoreApiUrl}/cart?_ms_cart=${randomUUID()}`,
      "/wp-json/wc/store/v1/cart",
      (data, response): data is CartDiagnostic => {
        const cart = data as Partial<CartDiagnostic> | null;
        return Boolean(cart && Array.isArray(cart.items) && cart.totals && typeof cart.totals === "object"
          && Array.isArray(cart.payment_methods) && cart.payment_methods.every(method => typeof method === "string")
          && response.headers.get("Cart-Token")
          && !/hit/i.test(response.headers.get("x-litespeed-cache") ?? "")
          && response.headers.get("cf-cache-status") !== "HIT"
          && !(Number(response.headers.get("age") ?? 0) > 0));
      },
    ),
    diagnosticRequest(
      `${config.wordpressApiUrl}/ms-headless/v1/status`,
      "/wp-json/ms-headless/v1/status",
      (data): data is BridgeDiagnostic => {
        const status = data as Partial<BridgeDiagnostic> | null;
        return Boolean(status && typeof status.cart_completion === "boolean" && typeof status.revalidation === "boolean");
      },
    ),
  ]);
  const methods = (store.data?.payment_methods ?? []).filter(method => method.startsWith("woo-pagarme-payments-"));
  const separateCheckout = new URL(config.wooCheckoutUrl).origin !== new URL(config.siteUrl).origin;
  const localRevalidation = (process.env.REVALIDATION_SECRET?.length ?? 0) >= 32;
  return {
    checkedAt: new Date().toISOString(),
    cart: store.check.ok,
    checkout: separateCheckout,
    pagarme: store.check.ok ? methods.length > 0 : null,
    paymentMethods: methods.map(method => method.replace("woo-pagarme-payments-", "")),
    // null means the remote state could not be verified, not an absent plugin.
    companionPlugin: bridge.data?.cart_completion ?? null,
    revalidation: !localRevalidation ? false : bridge.data?.revalidation ?? null,
    localRevalidation,
    checks: { store: store.check, bridge: bridge.check },
    infrastructureReady: store.check.ok && separateCheckout && methods.length > 0 && bridge.data?.cart_completion === true,
    paymentTest: "pending-manual-validation",
  };
}

import { config } from "@/lib/config";
import { randomUUID } from "node:crypto";

export async function runCommerceDiagnostic() {
  const [store, bridge] = await Promise.allSettled([
    fetch(`${config.wooStoreApiUrl}/cart?_ms_cart=${randomUUID()}`, { cache: "no-store", signal: AbortSignal.timeout(10_000) }),
    fetch(`${config.wordpressApiUrl}/ms-headless/v1/status`, { cache: "no-store", signal: AbortSignal.timeout(10_000) }),
  ]);
  const storeResponse = store.status === "fulfilled" ? store.value : null;
  const data = await storeResponse?.json().catch(() => null);
  const bridgeResponse = bridge.status === "fulfilled" ? bridge.value : null;
  const bridgeData = await bridgeResponse?.json().catch(() => null);
  const methods: string[] = (data?.payment_methods ?? []).filter((value: unknown) => typeof value === "string" && value.startsWith("woo-pagarme-payments-"));
  const cartReady = Boolean(storeResponse?.ok && storeResponse.headers.get("Cart-Token"));
  const separateCheckout = new URL(config.wooCheckoutUrl).origin !== new URL(config.siteUrl).origin;
  const completionReady = Boolean(bridgeResponse?.ok && bridgeData?.cart_completion);
  return {
    cart: cartReady,
    checkout: separateCheckout,
    pagarme: methods.length > 0,
    paymentMethods: methods.map((method) => method.replace("woo-pagarme-payments-", "")),
    companionPlugin: completionReady,
    revalidation: Boolean(bridgeData?.revalidation && process.env.REVALIDATION_SECRET),
    // This is infrastructure readiness, never proof that a payment was tested.
    infrastructureReady: cartReady && separateCheckout && methods.length > 0 && completionReady,
    paymentTest: "pending-manual-validation",
  };
}

import { config } from "@/lib/config";
import { plainText } from "@/lib/html";
import type { WooProduct } from "@/lib/types";
import type { ShippingEstimate, ShippingInput } from "@/lib/shipping-validation";

export class ShippingError extends Error {
  constructor(message: string, public status = 503) { super(message); }
}

const text = (value: unknown) => typeof value === "string" ? plainText(value).slice(0,300) : "";

export async function estimateShipping(input: ShippingInput): Promise<ShippingEstimate> {
  const unavailable = "Não foi possível consultar o frete agora. Tente novamente em instantes.";
  // Public catalog lookup prevents invalid IDs from reaching the plugin. Prices,
  // weights and dimensions are always resolved by WooCommerce, never the browser.
  const productResponse = await fetch(`${config.wooStoreApiUrl}/products/${input.productId}`, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000) });
  if (productResponse.status === 404) throw new ShippingError("Produto não encontrado.", 404);
  if (!productResponse.ok) throw new ShippingError(unavailable);
  const product = await productResponse.json() as WooProduct;
  if (product.id !== input.productId || !["simple", "variation"].includes(product.type)) throw new ShippingError("Selecione uma opção válida do produto antes de calcular.", 422);
  if (product.is_in_stock === false || product.is_purchasable === false) throw new ShippingError("Este produto está indisponível.", 422);
  const { minimum = 1, maximum = 9999, multiple_of = 1 } = product.add_to_cart ?? {};
  if (input.quantity < minimum || input.quantity > maximum || input.quantity % multiple_of !== 0) throw new ShippingError("Confira a quantidade disponível para este produto.", 422);

  // Native Melhor Envio product calculator (verified against installed 2.16.5).
  // Despite its name, cep_origem is the DESTINATION CEP in this plugin action.
  // Never forward Authorization, Cookie or Cart-Token, or relay Set-Cookie.
  const response = await fetch(`${config.wordpressSiteUrl}/wp-admin/admin-ajax.php`, {
    method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(25_000),
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-store" },
    body: new URLSearchParams({ action: "cotation_product_page", "data[cep_origem]": input.postcode, "data[id_produto]": String(input.productId), "data[quantity]": String(input.quantity) }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success !== true) {
    const message = text(data?.error ?? data?.message);
    if (/Não existem métodos|Não encontramos|CEP|Cotação disponível apenas no carrinho/i.test(message)) throw new ShippingError(message, 422);
    throw new ShippingError(unavailable);
  }
  if (!Array.isArray(data?.data?.quotations)) throw new ShippingError(unavailable);
  return { quotes: data.data.quotations.slice(0,30).flatMap((rate: Record<string, unknown>) => {
    if (!rate || typeof rate !== "object") return [];
    const name = text(rate.name), price = text(rate.price);
    if (!name || !price) return [];
    return [{ name, price, deliveryTime: typeof rate.delivery_time === "number" && Number.isFinite(rate.delivery_time) ? `${rate.delivery_time} dias úteis` : text(rate.delivery_time).replace(/^\((.*)\)$/, "$1"), observations: text(rate.observations) }];
  }) };
}

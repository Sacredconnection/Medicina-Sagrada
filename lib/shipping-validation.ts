export type ShippingInput = { productId: number; quantity: number; postcode: string };
export type ShippingQuote = { name: string; price: string; deliveryTime: string; observations: string };
export type ShippingEstimate = { quotes: ShippingQuote[] };

export function parseShippingInput(input: unknown): ShippingInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Solicitação inválida.");
  const value = input as Record<string, unknown>;
  if (!Number.isSafeInteger(value.productId) || Number(value.productId) < 1) throw new Error("Selecione uma opção do produto.");
  if (!Number.isSafeInteger(value.quantity) || Number(value.quantity) < 1 || Number(value.quantity) > 9999) throw new Error("Informe uma quantidade válida.");
  if (typeof value.postcode !== "string" || !/^\d{5}-?\d{3}$/.test(value.postcode.trim())) throw new Error("Informe um CEP com 8 números.");
  const postcode = value.postcode.trim().replace("-", "");
  if (/^(\d)\1{7}$/.test(postcode)) throw new Error("Informe um CEP válido.");
  return { productId: Number(value.productId), quantity: Number(value.quantity), postcode };
}

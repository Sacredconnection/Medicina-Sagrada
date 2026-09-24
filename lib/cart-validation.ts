export class CartInputError extends Error {}

export type CartAction =
  | { action: "add"; id: number; quantity: number; variation?: Array<{ attribute: string; value: string }> }
  | { action: "update"; key: string; quantity: number }
  | { action: "remove"; key: string }
  | { action: "apply-coupon" | "remove-coupon"; code: string };

const positiveInteger = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value > 0;

export function parseCartAction(input: unknown): CartAction {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new CartInputError("Solicitação inválida.");
  const value = input as Record<string, unknown>;
  const quantity = value.quantity === undefined ? 1 : value.quantity;
  if (value.action === "add" || value.action === "update") {
    if (!positiveInteger(quantity) || (quantity as number) > 9999) throw new CartInputError("Informe uma quantidade entre 1 e 9999.");
  }
  if (value.action === "add") {
    if (!positiveInteger(value.id)) throw new CartInputError("Produto inválido.");
    let variation: Array<{ attribute: string; value: string }> | undefined;
    if (value.variation !== undefined) {
      if (!Array.isArray(value.variation) || value.variation.length > 20) throw new CartInputError("Opções inválidas.");
      variation = value.variation.map((entry: unknown) => {
        if (!entry || typeof entry !== "object") throw new CartInputError("Opção inválida.");
        const option = entry as Record<string, unknown>;
        if (typeof option.attribute !== "string" || typeof option.value !== "string" || !option.attribute || !option.value || option.attribute.length > 100 || option.value.length > 200) throw new CartInputError("Selecione as opções do produto.");
        return { attribute: option.attribute, value: option.value };
      });
    }
    return { action: "add", id: value.id as number, quantity: quantity as number, ...(variation ? { variation } : {}) };
  }
  if (value.action === "update" || value.action === "remove") {
    if (typeof value.key !== "string" || !/^[a-f0-9]{32}$/.test(value.key)) throw new CartInputError("Item inválido.");
    return value.action === "remove" ? { action: "remove", key: value.key } : { action: "update", key: value.key, quantity: quantity as number };
  }
  if (value.action === "apply-coupon" || value.action === "remove-coupon") {
    if (typeof value.code !== "string" || !value.code.trim() || value.code.length > 100) throw new CartInputError("Informe um cupom válido.");
    return { action: value.action, code: value.code.trim() };
  }
  throw new CartInputError("Operação não permitida.");
}

export function isSameOrigin(request: Request, siteUrl: string) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site" || !origin) return false;
  return origin === new URL(request.url).origin || origin === new URL(siteUrl).origin;
}

// Read with a limit even if Content-Length is missing or incorrect.
export async function readCartBody(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new CartInputError("Envie uma solicitação JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new CartInputError("Solicitação vazia.");
  let body = "";
  let size = 0;
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 8192) { await reader.cancel(); throw new CartInputError("Solicitação muito grande."); }
    body += decoder.decode(value, { stream: true });
  }
  try { return JSON.parse(body + decoder.decode()); } catch { throw new CartInputError("JSON inválido."); }
}

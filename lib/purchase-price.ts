import { parseDocument } from "htmlparser2";
import { findAll, textContent } from "domutils";
import type { WooProduct } from "./types";

export type PurchasePrice = {
  amount: string;
  maximum?: string;
  regular?: string;
  regularMaximum?: string;
};

const validAmount = (value: string) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value));

// Some store discounts are published only in price_html. Read the exact amounts
// for each product; never infer a variant's discount from its parent's range.
export function getPurchasePrice(product: Pick<WooProduct, "prices" | "price_html">): PurchasePrice | null {
  const { prices } = product;
  const range = prices.price_range;
  const amount = range?.min_amount ?? prices.price;
  const maximum = range?.max_amount;
  const fallback: PurchasePrice | null = validAmount(amount) && (!maximum || (validAmount(maximum) && Number(maximum) >= Number(amount)))
    ? {
      amount,
      ...(maximum && maximum !== amount ? { maximum } : {}),
      ...(!range && validAmount(prices.regular_price) && Number(prices.regular_price) > Number(amount) ? { regular: prices.regular_price } : {}),
    } : null;

  const document = parseDocument(product.price_html || "");
  const discounted = findAll(node => node.name === "ins", document.children);
  const original = findAll(node => node.name === "del", document.children);
  if (discounted.length !== 1 || original.length !== 1) return fallback;

  const parseAmount = (text: string) => {
    let value = text;
    for (const marker of [prices.currency_symbol, prices.currency_prefix, prices.currency_suffix]) {
      if (marker) value = value.split(marker).join("");
    }
    value = value.replace(/\s/g, "");
    const parts = value.split(prices.currency_decimal_separator || ".");
    const groups = prices.currency_thousand_separator ? parts[0].split(prices.currency_thousand_separator) : [parts[0]];
    if (groups.length > 1 && (!/^\d{1,3}$/.test(groups[0]) || groups.slice(1).some(group => !/^\d{3}$/.test(group)))) return null;
    const integer = groups.join("");
    if (parts.length > 2 || !/^\d+$/.test(integer) || (parts[1] !== undefined && !/^\d+$/.test(parts[1])) || (parts[1]?.length ?? 0) > prices.currency_minor_unit) return null;
    const minor = integer + (parts[1] ?? "").padEnd(prices.currency_minor_unit, "0");
    return validAmount(minor) ? String(Number(minor)) : null;
  };
  const amounts = (node: typeof discounted[number]) => {
    const elements = findAll(element => (element.attribs.class ?? "").split(/\s+/).includes("woocommerce-Price-amount"), node.children);
    return (elements.length ? elements : [node]).map(element => parseAmount(textContent(element)));
  };
  const sale = amounts(discounted[0]);
  const regular = amounts(original[0]);
  if (!sale.length || sale.length > 2 || sale.length !== regular.length || sale.some(value => value === null) || regular.some(value => value === null)) return fallback;
  const current = sale as string[], previous = regular as string[];
  if (current.some((value, index) => Number(value) > Number(previous[index])) || !current.some((value, index) => Number(value) < Number(previous[index]))) return fallback;
  if (current.length === 2 && (Number(current[1]) < Number(current[0]) || Number(previous[1]) < Number(previous[0]))) return fallback;
  return {
    amount: current[0],
    ...(current[1] && current[1] !== current[0] ? { maximum: current[1] } : {}),
    regular: previous[0],
    ...(previous[1] && previous[1] !== previous[0] ? { regularMaximum: previous[1] } : {}),
  };
}

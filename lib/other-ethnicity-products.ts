import type { WooProduct } from "@/lib/types";

export function selectOtherEthnicityProducts(
  products: WooProduct[],
  excludedCategoryIds: readonly number[],
  otherCategoryIds: readonly number[],
) {
  const selected: WooProduct[] = [];
  const represented = new Set<number>();

  for (const product of products) {
    if (product.is_in_stock === false || product.is_purchasable === false) continue;
    if (product.categories.some(({ id }) => excludedCategoryIds.includes(id))) continue;
    if (selected.some(({ id }) => id === product.id)) continue;

    const ethnicities = product.categories.filter(({ id }) => otherCategoryIds.includes(id));
    if (!ethnicities.length || ethnicities.some(({ id }) => represented.has(id))) continue;

    selected.push(product);
    ethnicities.forEach(({ id }) => represented.add(id));
    if (selected.length === 4) break;
  }

  return selected;
}

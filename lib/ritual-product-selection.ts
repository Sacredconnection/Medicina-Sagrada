import type { RitualRecommendation } from "@/lib/rituals-data";
import type { WooProduct } from "@/lib/types";

type RitualProductConfig = RitualRecommendation["produtoPrincipal"];

export type ResolvedRitualProduct = {
  config: RitualProductConfig;
  product: WooProduct;
  variations: WooProduct[];
};

const isPurchasable = (product: WooProduct) =>
  product.is_in_stock !== false && product.is_purchasable !== false;

export function chooseAvailableRitualProduct(
  candidates: RitualProductConfig[],
  products: WooProduct[],
  variationsByProduct: Record<string, WooProduct[]>,
): ResolvedRitualProduct | null {
  const seenSlugs = new Set<string>();

  for (const config of candidates) {
    if (seenSlugs.has(config.slug)) continue;
    seenSlugs.add(config.slug);

    const product = products.find(({ slug }) => slug === config.slug);
    if (!product || !isPurchasable(product)) continue;

    const variations = variationsByProduct[product.slug] ?? [];
    if (product.type === "variable" && !variations.some(isPurchasable)) continue;

    return { config, product, variations };
  }

  return null;
}

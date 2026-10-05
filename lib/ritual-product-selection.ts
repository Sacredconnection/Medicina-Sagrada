import type { RitualProductCandidate } from "@/lib/rituals-data";
import type { WooProduct } from "@/lib/types";

export type ResolvedRitualProduct = {
  config: RitualProductCandidate;
  product: WooProduct;
  variations: WooProduct[];
};

type CatalogCandidate = Pick<WooProduct, "slug" | "is_in_stock" | "is_purchasable">;

const isPurchasable = (product: CatalogCandidate) =>
  product.is_in_stock !== false && product.is_purchasable !== false;

export function chooseAvailableRitualProduct(
  candidates: readonly RitualProductCandidate[],
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

// Catalog cards remain useful when live variation details are unavailable.
// Purchase controls still require a confirmed variation for variable products.
export function getRitualCatalogFallback<T extends CatalogCandidate>(
  candidates: readonly RitualProductCandidate[],
  applicatorSlug: string,
  products: T[],
) {
  const primary = candidates
    .map(({ slug }) => products.find((product) => product.slug === slug))
    .find((product) => product && isPurchasable(product));
  const applicator = products.find(
    (product) => product.slug === applicatorSlug && isPurchasable(product),
  );
  return {
    primary: primary ? { product: primary, variations: [] as WooProduct[] } : null,
    applicator: applicator ? { product: applicator, variations: [] as WooProduct[] } : null,
  };
}

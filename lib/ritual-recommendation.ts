import { chooseAvailableRitualProduct, getRitualCatalogFallback } from "@/lib/ritual-product-selection";
import {
  ritualsData,
  type RitualExperienceId,
  type RitualIntentionId,
  type RitualKey,
} from "@/lib/rituals-data";
import type { WooProduct } from "@/lib/types";
import { getAllProducts, getProductVariations } from "@/lib/woocommerce";

export type RitualRecommendationProduct = {
  product: WooProduct;
  variations: WooProduct[];
};

export type RitualRecommendationResult = {
  primary: RitualRecommendationProduct | null;
  applicator: RitualRecommendationProduct | null;
};

export async function getAvailableRitualRecommendation(
  intention: RitualIntentionId,
  experience: RitualExperienceId,
): Promise<RitualRecommendationResult> {
  const recommendation = ritualsData[`${intention}:${experience}` as RitualKey];
  const products = await getAllProducts();
  const fallback = getRitualCatalogFallback(
    recommendation.produtoPrincipal.candidatos, recommendation.aplicador.slug, products,
  );
  const slugs = new Set([
    ...recommendation.produtoPrincipal.candidatos.map(({ slug }) => slug),
    recommendation.aplicador.slug,
  ]);
  const candidates = products.filter((product) => slugs.has(product.slug));
  const entries = await Promise.all(candidates.map(async (product) => {
    const variations = await getProductVariations(product, { timeoutMs: 2500 }).catch(() => []);
    return [product.slug, variations] as const;
  }));
  const variationsByProduct = Object.fromEntries(entries);
  const resolved = chooseAvailableRitualProduct(
    recommendation.produtoPrincipal.candidatos, products, variationsByProduct,
  );
  // Only fall back when details are missing, never when variants are confirmed sold out.
  const unresolvedProducts = products.filter((product) =>
    product.type !== "variable" || !(variationsByProduct[product.slug]?.length),
  );
  const unresolved = getRitualCatalogFallback(
    recommendation.produtoPrincipal.candidatos, recommendation.aplicador.slug, unresolvedProducts,
  );
  return {
    primary: resolved
      ? { product: resolved.product, variations: resolved.variations }
      : unresolved.primary,
    applicator: fallback.applicator
      ? { ...fallback.applicator, variations: variationsByProduct[recommendation.aplicador.slug] ?? [] }
      : null,
  };
}

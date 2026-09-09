import type { WooProduct } from "@/lib/types";
import { getAllProducts } from "@/lib/woocommerce";

export type MatcherOptionId =
  | "grounding"
  | "purification"
  | "heart"
  | "vision"
  | "strength"
  | "serenity"
  | "protection"
  | "craft";

export type ProductMatcherGroups = Record<MatcherOptionId, WooProduct[]>;

const intentKeywords: Record<Exclude<MatcherOptionId, "craft">, string[]> = {
  grounding: ["aterramento", "aterrar", "presenca", "concentracao", "foco"],
  purification: ["purificacao", "descarrego", "limpeza", "defum", "breu", "incenso"],
  heart: ["coracao", "amor", "emocional"],
  vision: ["visao", "sonho", "sonhos", "intuicao"],
  strength: ["forca", "guerreir", "disposicao", "energia"],
  serenity: ["silencio", "serenidade", "calma", "meditacao"],
  protection: ["protecao", "fechamento", "escudo", "defesa"],
};

const medicineCategorySlugs = new Set(["rape", "incensos", "sananga-medicinais"]);
const craftCategorySlugs = new Set(["kuripes", "tepis", "artesanato"]);

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const includesCategory = (product: WooProduct, slugs: Set<string>) =>
  product.categories.some((category) => slugs.has(category.slug));

const hasDisplayPrice = (product: WooProduct) => {
  if (Number(product.prices.price) > 0) return true;
  return Number(product.prices.price_range?.min_amount ?? 0) > 0;
};

const toMatcherProduct = (product: WooProduct): WooProduct => ({
  ...product,
  description: "",
  short_description: "",
  price_html: "",
});

const relevanceScore = (product: WooProduct, keywords: string[]) => {
  const name = normalize(`${product.name} ${product.slug}`);
  const summary = normalize(product.short_description);
  const description = normalize(product.description);

  return keywords.reduce((score, keyword) => {
    if (name.includes(keyword)) return score + 5;
    if (summary.includes(keyword)) return score + 3;
    if (description.includes(keyword)) return score + 1;
    return score;
  }, 0);
};

export function getFallbackMatcherGroups(products: WooProduct[]): ProductMatcherGroups {
  const availableProducts = products.filter(
    (product) => product.is_in_stock !== false && hasDisplayPrice(product),
  );
  const medicines = availableProducts.filter((product) =>
    includesCategory(product, medicineCategorySlugs),
  );
  const semanticGroups = Object.fromEntries(
    Object.entries(intentKeywords).map(([intent, keywords]) => [
      intent,
      medicines
        .map((product) => ({ product, score: relevanceScore(product, keywords) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map(({ product }) => toMatcherProduct(product)),
    ]),
  ) as Omit<ProductMatcherGroups, "craft">;

  return {
    ...semanticGroups,
    craft: availableProducts
      .filter((product) => includesCategory(product, craftCategorySlugs))
      .slice(0, 4)
      .map(toMatcherProduct),
  };
}

export async function getHomeMatcherGroups(): Promise<ProductMatcherGroups | null> {
  try {
    return getFallbackMatcherGroups(await getAllProducts());
  } catch {
    return null;
  }
}

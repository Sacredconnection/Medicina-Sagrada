import type { WooProduct } from "@/lib/types";

// Only the fields used by the browser's ritual catalog fallback.
export type RitualCatalogProduct = Pick<WooProduct,
  "id" | "name" | "slug" | "type" | "is_in_stock" | "is_purchasable" | "variations"
> & {
  prices: Pick<WooProduct["prices"], "price" | "price_range" | "currency_code" | "currency_minor_unit">;
  images: Array<Pick<WooProduct["images"][number], "id" | "src" | "thumbnail" | "alt">>;
};

export function toRitualCatalog(products: WooProduct[]): RitualCatalogProduct[] {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    type: product.type,
    is_in_stock: product.is_in_stock,
    is_purchasable: product.is_purchasable,
    variations: product.variations,
    prices: {
      price: product.prices.price,
      price_range: product.prices.price_range,
      currency_code: product.prices.currency_code,
      currency_minor_unit: product.prices.currency_minor_unit,
    },
    images: product.images.slice(0, 1).map(({ id, src, thumbnail, alt }) => ({ id, src, thumbnail, alt })),
  }));
}

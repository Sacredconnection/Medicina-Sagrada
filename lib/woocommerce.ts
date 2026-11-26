import { fetchAll, wooFetch, wooCollection } from "@/lib/api";
import { sortOptions, type CatalogQuery } from "@/lib/catalog-query";
import type { WooCategory, WooProduct } from "@/lib/types";
import { withPurchasePrice } from "@/lib/purchase-price";

export async function getCatalog(query: CatalogQuery, categoryId?: number, page = query.page, tagId?: number) {
  const sort = sortOptions[query.sort];
  const intentionFilters = query.intention ? [
    { attribute: "pa_intencao-principal", slug: query.intention },
    { attribute: "pa_intencoes-secundarias", slug: query.intention },
  ] : [];
  const attributeQuery = Object.fromEntries(intentionFilters.flatMap((filter, index) => [
    [`attributes[${index}][attribute]`, filter.attribute],
    [`attributes[${index}][slug]`, filter.slug],
  ]));
  const result = await wooCollection<WooProduct>("products", {
    per_page: 12, page, search: query.q || undefined,
    category: query.categories.length ? query.categories.join(",") : categoryId, category_operator: "in", orderby: sort.orderby, order: sort.order,
    tag: tagId,
    min_price: query.min, max_price: query.max,
    "stock_status[0]": query.stock ? "instock" : undefined,
    on_sale: query.sale ? true : undefined,
    catalog_visibility: query.q ? "search" : "catalog",
    ...attributeQuery,
    attribute_relation: query.intention ? "or" : undefined,
  }, ["woocommerce", "products"]);
  return { ...result, data: result.data.map(withPurchasePrice) };
}

export async function getProductBySlug(slug: string) {
  const products = await wooFetch<WooProduct[]>(
    "products",
    { slug, per_page: 1 },
    ["woocommerce", "products", `product:${slug}`],
  );
  return products[0] ? withPurchasePrice(products[0]) : null;
}

export async function getProductsBySlugs(slugs: string[]) {
  const unique = [...new Set(slugs)].filter(Boolean).slice(0, 100);
  if (!unique.length) return [];
  const products = await wooFetch<WooProduct[]>("products", { slug: unique.join(","), per_page: 100 }, ["woocommerce", "products"]);
  // Do not accidentally recommend unrelated products if an upstream ignores slug.
  return products.filter(product => unique.includes(product.slug)).map(withPurchasePrice);
}

export async function getProductVariations(
  product: WooProduct,
  options: { requireResponse?: boolean; timeoutMs?: number } = {},
) {
  if (product.type !== "variable") return [];
  const variationReferences = (product.variations ?? []).slice(0, 60);
  if (!variationReferences.length) return [];
  // Use the same detail endpoint as the weight picker. A failed weight must
  // not discard the other prices or bypass their cached WooCommerce responses.
  const results = await Promise.allSettled(variationReferences.map((variant) =>
    wooFetch<WooProduct>(`products/${variant.id}`, {}, ["woocommerce", "products", `product:${product.slug}`], options.timeoutMs)
      .then((variation) => {
        if (variation.id !== variant.id || variation.type !== "variation") {
          throw new Error(`Variação inválida: ${variant.id}.`);
        }
        return withPurchasePrice(variation);
      }),
  ));
  const variations = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );

  if (options.requireResponse && variationReferences.length > 0 && variations.length === 0) {
    throw new Error(`Não foi possível consultar as variações de ${product.slug}.`);
  }

  return variations;
}

export async function getProducts(
  options: {
    categoryId?: number;
    page?: number;
    perPage?: number;
    search?: string;
    orderby?: "menu_order" | "popularity";
  } = {},
) {
  const products = await wooFetch<WooProduct[]>(
    "products",
    {
      category: options.categoryId,
      page: options.page ?? 1,
      per_page: options.perPage ?? 12,
      search: options.search,
      orderby: options.orderby ?? "menu_order",
      order: options.orderby === "popularity" ? "desc" : "asc",
    },
    [
      "woocommerce",
      "products",
      ...(options.categoryId
        ? [`product-category:${options.categoryId}`]
        : []),
    ],
  );
  return products.map(withPurchasePrice);
}

export async function getProductCategoryBySlug(slug: string) {
  // A Store API aceita o parâmetro `slug` sem erro, mas atualmente o ignora
  // neste endpoint. Percorremos as páginas e fazemos a correspondência exata
  // localmente para não resolver uma categoria incorreta.
  for (let page = 1; page <= 50; page += 1) {
    const categories = await wooFetch<WooCategory[]>(
      "products/categories",
      { per_page: 100, page },
      [
        "woocommerce",
        "product-categories",
        `product-category-slug:${slug}`,
      ],
    );
    const category = categories.find((item) => item.slug === slug);
    if (category) return category;
    if (categories.length < 100) break;
  }

  return null;
}

export const getAllProducts = () =>
  fetchAll((page) =>
    wooFetch<WooProduct[]>(
      "products",
      { per_page: 100, page },
      ["woocommerce", "products"],
    ),
  ).then(products => products.map(withPurchasePrice));

export type WooTag = Pick<WooCategory, "id" | "name" | "slug" | "description" | "count">;

export const getAllProductTags = () => fetchAll(page =>
  wooFetch<WooTag[]>("products/tags", { per_page: 100, page, hide_empty: true }, ["woocommerce", "product-tags"]),
);

export async function getProductTagBySlug(slug: string) {
  // This endpoint has no slug filter. Match exactly after fetching the terms.
  return (await getAllProductTags()).find(tag => tag.slug === slug) ?? null;
}

export const getAllProductCategories = () =>
  fetchAll((page) =>
    wooFetch<WooCategory[]>(
      "products/categories",
      { per_page: 100, page },
      ["woocommerce", "product-categories"],
    ),
  );

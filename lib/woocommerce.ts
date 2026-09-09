import { fetchAll, wooFetch } from "@/lib/api";
import type { WooCategory, WooProduct } from "@/lib/types";

export async function getProductBySlug(slug: string) {
  const products = await wooFetch<WooProduct[]>(
    "products",
    { slug, per_page: 1 },
    ["woocommerce", "products", `product:${slug}`],
  );
  return products[0] ?? null;
}

export async function getProducts(
  options: {
    categoryId?: number;
    page?: number;
    perPage?: number;
    search?: string;
  } = {},
) {
  return wooFetch<WooProduct[]>(
    "products",
    {
      category: options.categoryId,
      page: options.page ?? 1,
      per_page: options.perPage ?? 12,
      search: options.search,
      orderby: "menu_order",
      order: "asc",
    },
    [
      "woocommerce",
      "products",
      ...(options.categoryId
        ? [`product-category:${options.categoryId}`]
        : []),
    ],
  );
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
  );

export const getAllProductCategories = () =>
  fetchAll((page) =>
    wooFetch<WooCategory[]>(
      "products/categories",
      { per_page: 100, page },
      ["woocommerce", "product-categories"],
    ),
  );

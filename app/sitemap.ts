import type { MetadataRoute } from "next";
import {
  getAllPostCategories,
  getAllPosts,
  getAllPages,
} from "@/lib/wordpress";
import {
  getAllProductCategories,
  getAllProducts,
} from "@/lib/woocommerce";
import { absoluteUrl, pathnameFromUrl } from "@/lib/url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const [pages, posts, products, productCategories, postCategories] =
      await Promise.all([
        getAllPages(),
        getAllPosts(),
        getAllProducts(),
        getAllProductCategories(),
        getAllPostCategories(),
      ]);

    return [
      ...home,
      ...pages
        .filter((page) => pathnameFromUrl(page.link) !== "/")
        .map((page) => ({
          url: absoluteUrl(pathnameFromUrl(page.link)),
          lastModified: new Date(page.modified),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })),
      ...posts.map((post) => ({
        url: absoluteUrl(pathnameFromUrl(post.link)),
        lastModified: new Date(post.modified),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...products.map((product) => ({
        url: absoluteUrl(`/product/${product.slug}/`),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...productCategories
        .filter((category) => category.count > 0)
        .map((category) => ({
          url: absoluteUrl(pathnameFromUrl(category.permalink)),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })),
      ...postCategories
        .filter((category) => category.count > 0)
        .map((category) => ({
          url: absoluteUrl(`/category/${category.slug}/`),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        })),
    ];
  } catch (error) {
    console.error("Não foi possível gerar o sitemap completo.", error);
    return home;
  }
}

import type { MetadataRoute } from "next";
import {
  getAllPostCategories,
  getAllPosts,
  getAllPages,
  getAllPostTags,
} from "@/lib/wordpress";
import {
  getAllProductCategories,
  getAllProducts,
  getAllProductTags,
} from "@/lib/woocommerce";
import { absoluteUrl, pathnameFromUrl } from "@/lib/url";
import { learnGuides } from "@/lib/learn-content";
import { finalizeSitemap } from "@/lib/sitemap-policy";
import { intentions } from "@/lib/intencoes";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "daily",
      priority: 1,
    },
    ...["/aprenda/", ...learnGuides.map((guide) => `/aprenda/${guide.slug}/`)].map((pathname) => ({
      url: absoluteUrl(pathname),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
  const intentionPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/intencoes/"), changeFrequency: "monthly", priority: 0.7 },
    ...intentions.map(({ slug }) => ({
      url: absoluteUrl(`/intencoes/${slug}/`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  try {
    const [pages, posts, products, productCategories, postCategories, postTags, productTags] =
      await Promise.all([
        getAllPages(),
        getAllPosts(),
        getAllProducts(),
        getAllProductCategories(),
        getAllPostCategories(),
        getAllPostTags(),
        getAllProductTags(),
      ]);

    return finalizeSitemap([
      ...home,
      ...intentionPages,
      ...postTags.filter(tag => tag.count > 0).map(tag => ({ url: absoluteUrl(`/tag/${tag.slug}/`), changeFrequency: "monthly" as const, priority: 0.5 })),
      ...productTags.filter(tag => tag.count > 0).map(tag => ({ url: absoluteUrl(`/product-tag/${tag.slug}/`), changeFrequency: "weekly" as const, priority: 0.6 })),
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
    ]);
  } catch (error) {
    console.error("Não foi possível gerar o sitemap completo.", error);
    // Do not replace a complete cached sitemap with a successful partial XML.
    // On a cold request this fails explicitly; revalidation can retain old data.
    throw error;
  }
}

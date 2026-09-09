import { fetchAll, wpFetch } from "@/lib/api";
import type { WordPressContent } from "@/lib/types";

const embeddedQuery = {
  _embed: 1,
  status: "publish",
};

export async function getPageBySlug(slug: string) {
  const pages = await wpFetch<WordPressContent[]>(
    "wp/v2/pages",
    { ...embeddedQuery, slug, per_page: 1 },
    ["wordpress", "pages", `page:${slug}`],
  );
  return pages[0] ?? null;
}

export async function getPostBySlug(slug: string) {
  const posts = await wpFetch<WordPressContent[]>(
    "wp/v2/posts",
    { ...embeddedQuery, slug, per_page: 1 },
    ["wordpress", "posts", `post:${slug}`],
  );
  return posts[0] ?? null;
}

export async function getPostsByCategory(
  categoryId: number,
  page = 1,
  perPage = 12,
) {
  return wpFetch<WordPressContent[]>(
    "wp/v2/posts",
    { ...embeddedQuery, categories: categoryId, page, per_page: perPage },
    ["wordpress", "posts", `post-category:${categoryId}`],
  );
}

export type WordPressCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
};

export async function getPostCategoryBySlug(slug: string) {
  const categories = await wpFetch<WordPressCategory[]>(
    "wp/v2/categories",
    { slug, per_page: 1 },
    ["wordpress", "post-categories", `post-category-slug:${slug}`],
  );
  return categories[0] ?? null;
}

export const getAllPages = () =>
  fetchAll((page) =>
    wpFetch<WordPressContent[]>(
      "wp/v2/pages",
      { status: "publish", per_page: 100, page },
      ["wordpress", "pages"],
    ),
  );

export const getAllPosts = () =>
  fetchAll((page) =>
    wpFetch<WordPressContent[]>(
      "wp/v2/posts",
      { status: "publish", per_page: 100, page },
      ["wordpress", "posts"],
    ),
  );

export const getAllPostCategories = () =>
  fetchAll((page) =>
    wpFetch<WordPressCategory[]>(
      "wp/v2/categories",
      { per_page: 100, page },
      ["wordpress", "post-categories"],
    ),
  );

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/pagination";
import { excerpt, plainText } from "@/lib/html";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";
import {
  getPostCategoryBySlug,
  getPostsByCategory,
} from "@/lib/wordpress";

export const revalidate = 900;
const POSTS_PER_PAGE = 12;

type PostCategoryProps = {
  params: Promise<{ slug: string[] }>;
};

const parseArchivePath = (segments: string[]) => {
  const pageMarkerIndex = segments.lastIndexOf("page");
  const page =
    pageMarkerIndex >= 0 ? Number(segments[pageMarkerIndex + 1]) : 1;
  const categorySegments =
    pageMarkerIndex >= 0 ? segments.slice(0, pageMarkerIndex) : segments;
  if (
    categorySegments.length !== 1 ||
    !Number.isInteger(page) ||
    page < 1 ||
    (pageMarkerIndex >= 0 && pageMarkerIndex !== segments.length - 2)
  ) {
    return null;
  }
  const categorySlug = categorySegments[0];
  const basePath = `/category/${categorySlug}/`;
  return {
    categorySlug,
    page,
    basePath,
    pathname: page === 1 ? basePath : `${basePath}page/${page}/`,
  };
};

export async function generateMetadata({
  params,
}: PostCategoryProps): Promise<Metadata> {
  const parsed = parseArchivePath((await params).slug);
  if (!parsed) return { robots: { index: false } };
  const category = await getPostCategoryBySlug(parsed.categorySlug);
  if (!category) return { robots: { index: false } };

  return createMetadata({
    title:
      parsed.page > 1
        ? `${plainText(category.name)} — Página ${parsed.page}`
        : plainText(category.name),
    description:
      excerpt(category.description) ||
      `Conteúdos sobre ${plainText(category.name)} na Medicina Sagrada.`,
    pathname: parsed.pathname,
  });
}

export default async function PostCategoryPage({
  params,
}: PostCategoryProps) {
  const parsed = parseArchivePath((await params).slug);
  if (!parsed) notFound();
  const category = await getPostCategoryBySlug(parsed.categorySlug);
  if (!category) notFound();
  const posts = await getPostsByCategory(
    category.id,
    parsed.page,
    POSTS_PER_PAGE,
  );
  if (parsed.page > 1 && posts.length === 0) notFound();

  const breadcrumbs = [
    { name: "Início", pathname: "/" },
    { name: category.name, pathname: parsed.basePath },
  ];

  return (
    <div className="container content-page">
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: category.name },
        ]}
      />
      <header className="archive-header">
        <p className="eyebrow">Conteúdos</p>
        <h1>{plainText(category.name)}</h1>
      </header>
      <section className="post-list">
        {posts.map((post) => (
          <article key={post.id}>
            <p className="eyebrow">
              {new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "long",
              }).format(new Date(post.date))}
            </p>
            <h2>
              <Link href={`/${post.slug}/`}>
                {plainText(post.title.rendered)}
              </Link>
            </h2>
            <p>{excerpt(post.excerpt.rendered)}</p>
          </article>
        ))}
      </section>
      <Pagination
        page={parsed.page}
        hasNextPage={posts.length === POSTS_PER_PAGE}
        basePath={parsed.basePath}
      />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
    </div>
  );
}

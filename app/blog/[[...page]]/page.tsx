import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Pagination } from "@/components/pagination";
import { ApiError, wpCollection } from "@/lib/api";
import { excerpt, plainText } from "@/lib/html";
import { createMetadata } from "@/lib/seo";
import type { WordPressContent } from "@/lib/types";
import { pathnameFromUrl } from "@/lib/url";

export const revalidate = 900;
type Props = { params: Promise<{ page?: string[] }> };

function pageNumber(segments: string[] = []) {
  if (!segments.length) return 1;
  if (segments.length !== 2 || segments[0] !== "page" || !/^[1-9]\d*$/.test(segments[1])) notFound();
  const number = Number(segments[1]);
  if (!Number.isSafeInteger(number)) notFound();
  return number;
}

export async function generateMetadata({ params }: Props) {
  const page = pageNumber((await params).page);
  return createMetadata({ title: page === 1 ? "Blog" : `Blog — Página ${page}`, description: "Histórias, cultura e saberes da floresta na Medicina Sagrada.", pathname: page === 1 ? "/blog/" : `/blog/page/${page}/` });
}

export default async function BlogPage({ params }: Props) {
  const page = pageNumber((await params).page);
  const result = await wpCollection<WordPressContent>("wp/v2/posts", { status: "publish", page, per_page: 12, orderby: "date", order: "desc" }, ["wordpress", "posts"]).catch((error) => {
    if (page > 1 && error instanceof ApiError && error.status === 400) notFound();
    throw error;
  });
  if (page > 1 && !result.data.length) notFound();

  return (
    <div className="container content-page">
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Blog" }]} />
      <header className="archive-header"><p className="eyebrow">Histórias e conhecimentos</p><h1>Blog</h1><p>Cultura, tradições e saberes da floresta.</p></header>
      <section className="post-list" aria-label="Artigos do blog">
        {result.data.map((post) => (
          <article key={post.id}>
            <p className="eyebrow"><time dateTime={post.date}>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(post.date))}</time></p>
            <h2><Link href={pathnameFromUrl(post.link)}>{plainText(post.title.rendered)}</Link></h2>
            <p>{excerpt(post.excerpt.rendered.replace(/\[\/?[\w-]+(?:\s[^\]]*)?\]/g, ""))}</p>
            <Link className="text-link" href={pathnameFromUrl(post.link)}>Ler artigo</Link>
          </article>
        ))}
      </section>
      {!result.data.length && <p>Novos artigos serão publicados em breve.</p>}
      <Pagination page={page} hasNextPage={page < result.totalPages} basePath="/blog/" />
    </div>
  );
}

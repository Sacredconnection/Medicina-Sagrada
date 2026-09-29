import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pagination } from "@/components/pagination";
import { ApiError, wpCollection } from "@/lib/api";
import { excerpt, plainText } from "@/lib/html";
import { createMetadata } from "@/lib/seo";
import type { WordPressContent } from "@/lib/types";
import { pathnameFromUrl } from "@/lib/url";
import { hiddenDemoPostIdsQuery } from "@/lib/wordpress";

export const revalidate = 900;
type Props = { params: Promise<{ page?: string[] }> };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });

function postImage(post: WordPressContent) {
  return post._embedded?.["wp:featuredmedia"]?.[0];
}

function BlogImage({ post, featured = false }: { post: WordPressContent; featured?: boolean }) {
  const media = postImage(post);
  const title = plainText(post.title.rendered);

  if (!media?.source_url) {
    return <span className="blog-image-fallback">Medicina Sagrada</span>;
  }

  return (
    <Image
      src={media.source_url}
      alt={media.alt_text?.trim() || title}
      fill
      sizes={featured ? "(max-width: 760px) 100vw, 58vw" : "(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"}
      loading={featured ? "eager" : "lazy"}
      fetchPriority={featured ? "high" : "auto"}
    />
  );
}

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
  const result = await wpCollection<WordPressContent>("wp/v2/posts", { _embed: 1, status: "publish", exclude: hiddenDemoPostIdsQuery, page, per_page: 12, orderby: "date", order: "desc" }, ["wordpress", "posts"]).catch((error) => {
    if (page > 1 && error instanceof ApiError && error.status === 400) notFound();
    throw error;
  });
  if (page > 1 && !result.data.length) notFound();

  const featuredPost = page === 1 ? result.data[0] : undefined;
  const posts = featuredPost ? result.data.slice(1) : result.data;

  return (
    <>
      {featuredPost ? (
        <article className="blog-featured">
          <Link className="blog-featured-image" href={pathnameFromUrl(featuredPost.link)} aria-label={`Ler ${plainText(featuredPost.title.rendered)}`}>
            <BlogImage post={featuredPost} featured />
          </Link>
          <div className="blog-featured-copy">
            <div className="blog-featured-meta">
              <span>Em destaque</span>
              <time dateTime={featuredPost.date}>{dateFormatter.format(new Date(featuredPost.date))}</time>
            </div>
            <h2><Link href={pathnameFromUrl(featuredPost.link)}>{plainText(featuredPost.title.rendered)}</Link></h2>
            <p>{excerpt(featuredPost.excerpt.rendered.replace(/\[\/?[\w-]+(?:\s[^\]]*)?\]/g, ""))}</p>
            <Link className="blog-read-link" href={pathnameFromUrl(featuredPost.link)}>Ler matéria</Link>
          </div>
        </article>
      ) : null}
      {posts.length ? (
        <section className="blog-archive" aria-labelledby="blog-archive-title">
          <div className="blog-archive-heading">
            <h2 id="blog-archive-title">{page === 1 ? "Outras histórias" : "Mais histórias"}</h2>
            <p>Conhecimentos, memórias e tradições para ler com tempo.</p>
          </div>
          <div className="blog-grid">
            {posts.map((post) => (
              <article className="blog-card" key={post.id}>
                <Link className="blog-card-link" href={pathnameFromUrl(post.link)}>
                  <span className="blog-card-image">
                    <BlogImage post={post} />
                  </span>
                  <div className="blog-card-copy">
                    <time dateTime={post.date}>{dateFormatter.format(new Date(post.date))}</time>
                    <h3>{plainText(post.title.rendered)}</h3>
                    <p className="blog-card-excerpt">{excerpt(post.excerpt.rendered.replace(/\[\/?[\w-]+(?:\s[^\]]*)?\]/g, ""))}</p>
                    <span className="blog-read-link">Ler artigo</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {!result.data.length && <p>Novos artigos serão publicados em breve.</p>}
      <Pagination page={page} hasNextPage={page < result.totalPages} basePath="/blog/" />
    </>
  );
}

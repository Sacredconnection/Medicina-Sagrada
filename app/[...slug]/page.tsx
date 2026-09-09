import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { plainText } from "@/lib/html";
import { breadcrumbSchema, metadataForContent } from "@/lib/seo";
import type { WordPressContent } from "@/lib/types";
import { ensureTrailingSlash, pathMatches } from "@/lib/url";
import { getPageBySlug, getPostBySlug } from "@/lib/wordpress";

export const revalidate = 900;

type ContentPageProps = {
  params: Promise<{ slug: string[] }>;
};

async function resolveContent(segments: string[]) {
  const slug = segments.at(-1);
  if (!slug) return null;
  const pathname = ensureTrailingSlash(`/${segments.join("/")}`);

  const page = await getPageBySlug(slug);
  if (page && pathMatches(page.link, pathname)) {
    return { content: page, pathname };
  }

  const post = await getPostBySlug(slug);
  if (post && pathMatches(post.link, pathname)) {
    return { content: post, pathname };
  }

  return null;
}

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const resolved = await resolveContent((await params).slug);
  if (!resolved) {
    return { title: "Página não encontrada", robots: { index: false } };
  }
  return metadataForContent(resolved.content, resolved.pathname);
}

const articleSchema = (content: WordPressContent, pathname: string) => ({
  "@context": "https://schema.org",
  "@type": content.type === "post" ? "Article" : "WebPage",
  "@id": `${pathname}#${content.type === "post" ? "article" : "webpage"}`,
  url: pathname,
  headline: plainText(content.title.rendered),
  datePublished: content.date,
  dateModified: content.modified,
  inLanguage: "pt-BR",
});

export default async function ContentPage({ params }: ContentPageProps) {
  const resolved = await resolveContent((await params).slug);
  if (!resolved) notFound();
  const { content, pathname } = resolved;
  const title = plainText(content.title.rendered);
  const breadcrumbs = [
    { name: "Início", pathname: "/" },
    { name: title, pathname },
  ];

  return (
    <article className="container content-page editorial-page">
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: title }]} />
      <header className="article-header">
        {content.type === "post" ? <p className="eyebrow">Conteúdo</p> : null}
        <h1>{title}</h1>
        {content.type === "post" ? (
          <time dateTime={content.date}>
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "long",
            }).format(new Date(content.date))}
          </time>
        ) : null}
      </header>
      <RichText html={content.content.rendered} />
      <JsonLd
        data={[
          articleSchema(content, pathname),
          breadcrumbSchema(breadcrumbs),
        ]}
      />
    </article>
  );
}

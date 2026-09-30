import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AboutContactSection } from "@/components/about-contact-section";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactPage } from "@/components/contact-page";
import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { articleShortcodeMediaIds, plainText, prepareArticleHtml } from "@/lib/html";
import { breadcrumbSchema, metadataForContent } from "@/lib/seo";
import type { WordPressContent } from "@/lib/types";
import { ensureTrailingSlash, pathMatches } from "@/lib/url";
import { getMediaByIds, getPageBySlug, getPostBySlug } from "@/lib/wordpress";

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
  const isPost = content.type === "post";
  const isAboutPage = pathname === "/sobre-nos/";
  const isContactPage = pathname === "/atendimento/";
  const shortcodeMedia = isPost
    ? await getMediaByIds(articleShortcodeMediaIds(content.content.rendered))
    : [];
  const articleHtml = isPost
    ? prepareArticleHtml(content.content.rendered, shortcodeMedia)
    : content.content.rendered;
  const featuredMedia = content._embedded?.["wp:featuredmedia"]?.[0];
  const readingMinutes = Math.max(1, Math.ceil(plainText(articleHtml).split(/\s+/).filter(Boolean).length / 210));
  const breadcrumbs = [
    { name: "Início", pathname: "/" },
    ...(isPost ? [{ name: "Blog", pathname: "/blog/" }] : []),
    { name: title, pathname },
  ];
  const breadcrumbItems = [
    { label: "Início", href: "/" },
    ...(isPost ? [{ label: "Blog", href: "/blog/" }] : []),
    { label: title },
  ];

  if (isContactPage) {
    return (
      <article className="container content-page editorial-page contact-page">
        <Breadcrumbs items={breadcrumbItems} />
        <ContactPage />
        <JsonLd
          data={[
            articleSchema(content, pathname),
            breadcrumbSchema(breadcrumbs),
          ]}
        />
      </article>
    );
  }

  return (
    <article
      className={`container content-page editorial-page${isPost ? " blog-post-page" : ""}${isAboutPage ? " about-page" : ""}`}
    >
      <Breadcrumbs items={breadcrumbItems} />
      <header className={`article-header${isPost ? " blog-article-header" : ""}`}>
        {isPost ? (
          <div className="blog-article-meta">
            <time dateTime={content.date}>
              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(content.date))}
            </time>
            <span aria-hidden="true">•</span>
            <span>{readingMinutes} min de leitura</span>
          </div>
        ) : null}
        <h1 className={isPost && title.length > 72 ? "blog-article-title-long" : undefined}>{title}</h1>
      </header>
      {isPost && featuredMedia?.source_url ? (
        <figure className="blog-article-hero">
          <Image
            src={featuredMedia.source_url}
            alt={featuredMedia.alt_text || title}
            width={featuredMedia.media_details?.width ?? 1600}
            height={featuredMedia.media_details?.height ?? 900}
            sizes="(max-width: 768px) 100vw, 1152px"
            priority
          />
        </figure>
      ) : null}
      {isPost ? (
        <div className="blog-article-layout">
          <aside className="blog-article-rail" aria-label="Navegação da matéria">
            <Link href="/blog/">Todas as matérias</Link>
          </aside>
          <RichText className="article-content" html={articleHtml} />
        </div>
      ) : (
        <RichText className={isAboutPage ? "about-content" : ""} html={articleHtml} />
      )}
      {isPost ? (
        <footer className="blog-article-footer">
          <p>Continue explorando histórias, saberes e tradições.</p>
          <Link href="/blog/">Ver todas as matérias</Link>
        </footer>
      ) : null}
      {isAboutPage ? <AboutContactSection /> : null}
      <JsonLd
        data={[
          articleSchema(content, pathname),
          breadcrumbSchema(breadcrumbs),
        ]}
      />
    </article>
  );
}

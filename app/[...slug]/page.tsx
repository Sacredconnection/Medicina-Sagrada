import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutContactSection } from "@/components/about-contact-section";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactPage } from "@/components/contact-page";
import { JsonLd } from "@/components/json-ld";
import { PrivacyPage } from "@/components/privacy-page";
import { RichText } from "@/components/rich-text";
import { ReturnsPage } from "@/components/returns-page";
import { WholesalePage } from "@/components/wholesale-page";
import { articleShortcodeMediaIds, plainText, prepareArticleHtml } from "@/lib/html";
import { BlogArticle } from "@/components/blog-article";
import { articleCtas, contextualizeArticleCta } from "@/lib/article-cta";
import { breadcrumbSchema, editorialSchema, metadataForContent } from "@/lib/seo";
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

  // Published blog permalinks can share a slug with a legacy page (e.g. /rape/).
  if (Object.hasOwn(articleCtas, slug)) {
    const post = await getPostBySlug(slug);
    if (post && pathMatches(post.link, pathname)) return { content: post, pathname };
  }

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

const articleSchema = (content: WordPressContent, pathname: string) => editorialSchema({
  type: content.type === "post" ? "Article" : "WebPage",
  pathname,
  headline: plainText(content.title.rendered),
  datePublished: content.date,
  dateModified: content.modified,
  image: content._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
});

export default async function ContentPage({ params }: ContentPageProps) {
  const resolved = await resolveContent((await params).slug);
  if (!resolved) notFound();
  const { content, pathname } = resolved;
  const title = plainText(content.title.rendered);
  const isPost = content.type === "post";
  const isAboutPage = pathname === "/sobre-nos/";
  const isContactPage = pathname === "/atendimento/";
  const isPrivacyPage = pathname === "/politica-de-privacidade/";
  const isReturnsPage = pathname === "/refund_returns/";
  const isWholesalePage = pathname === "/atacado/";
  const shortcodeMedia = isPost
    ? await getMediaByIds(articleShortcodeMediaIds(content.content.rendered))
    : [];
  const articleHtml = isPost
    ? contextualizeArticleCta(content, prepareArticleHtml(content.content.rendered, shortcodeMedia))
    : content.content.rendered;
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

  if (isWholesalePage) {
    return (
      <article className="container content-page editorial-page wholesale-page">
        <Breadcrumbs items={breadcrumbItems} />
        <WholesalePage />
        <JsonLd
          data={[
            articleSchema(content, pathname),
            breadcrumbSchema(breadcrumbs),
          ]}
        />
      </article>
    );
  }

  if (isPrivacyPage) {
    return (
      <article className="container content-page editorial-page policy-page">
        <Breadcrumbs items={breadcrumbItems} />
        <PrivacyPage html={articleHtml} />
        <JsonLd
          data={[
            articleSchema(content, pathname),
            breadcrumbSchema(breadcrumbs),
          ]}
        />
      </article>
    );
  }

  if (isReturnsPage) {
    return (
      <article className="container content-page editorial-page policy-page returns-page">
        <Breadcrumbs items={breadcrumbItems} />
        <ReturnsPage />
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
    <article className={`container content-page editorial-page${isPost ? " blog-post-page" : ""}${isAboutPage ? " about-page" : ""}`}>
      <Breadcrumbs items={breadcrumbItems} />
      {isPost ? <BlogArticle content={content} html={articleHtml} /> : <>
        <header className="article-header"><h1>{title}</h1></header>
        <RichText className={isAboutPage ? "about-content" : ""} html={articleHtml} />
      </>}
      {isAboutPage ? <AboutContactSection /> : null}
      <JsonLd data={[articleSchema(content, pathname), breadcrumbSchema(breadcrumbs)]} />
    </article>
  );
}

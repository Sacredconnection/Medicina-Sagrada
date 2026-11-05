import Image from "next/image";
import Link from "next/link";
import { ArticleContent } from "@/components/article-content";
import { ArticleSidebar } from "@/components/article-sidebar";
import { cleanHtml, plainText } from "@/lib/html";
import type { WordPressContent } from "@/lib/types";

export function BlogArticle({ content, html }: { content: WordPressContent; html: string }) {
  const title = plainText(content.title.rendered);
  const image = content._embedded?.["wp:featuredmedia"]?.[0];
  const minutes = Math.max(1, Math.ceil(plainText(html).split(/\s+/).filter(Boolean).length / 210));

  return <div className="blog-article-layout">
    <div className="blog-article-main">
      {image?.source_url ? <figure className="blog-article-hero">
        <Image src={image.source_url} alt={image.alt_text || title} width={image.media_details?.width ?? 1600} height={image.media_details?.height ?? 900} sizes="(max-width: 1000px) 100vw, 960px" priority />
      </figure> : null}
      <header className="article-header blog-article-header">
        <h1>{title}</h1>
        <div className="blog-article-meta">
          <time dateTime={content.date}>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(content.date))}</time>
          <span aria-hidden="true">•</span><span>{minutes} min de leitura</span>
        </div>
      </header>
      <ArticleContent html={cleanHtml(html)} />
      <footer className="blog-article-footer">
        <p>Continue explorando histórias, saberes e tradições.</p>
        <Link href="/blog/">Ver todas as matérias</Link>
      </footer>
    </div>
    <ArticleSidebar />
  </div>;
}

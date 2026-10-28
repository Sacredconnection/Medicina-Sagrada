import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { Pagination } from "@/components/pagination";
import { ApiError } from "@/lib/api";
import { parseTagArchive } from "@/lib/archive-path";
import { excerpt, plainText } from "@/lib/html";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";
import { getPostTagBySlug, getPostsByTag } from "@/lib/wordpress";

export const revalidate = 900;
type Props = { params: Promise<{ slug: string[] }> };

async function resolve(params: Props["params"]) {
  const parsed = parseTagArchive((await params).slug, "tag");
  if (!parsed) notFound();
  const tag = await getPostTagBySlug(parsed.slug);
  if (!tag || (parsed.page > 1 && (parsed.page - 1) * 12 >= tag.count)) notFound();
  return { ...parsed, tag, name: plainText(tag.name) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name, tag, page, pathname } = await resolve(params);
  return createMetadata({ title: page > 1 ? `${name} — Página ${page}` : name,
    description: excerpt(tag.description) || `Conteúdos sobre ${name} na Medicina Sagrada.`, pathname });
}

export default async function PostTagPage({ params }: Props) {
  const { name, tag, page, basePath } = await resolve(params);
  const result = await getPostsByTag(tag.id, page).catch(error => {
    if (page > 1 && error instanceof ApiError && error.status === 400) notFound();
    throw error;
  });
  if (page > 1 && !result.data.length) notFound();
  return <div className="container content-page">
    <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: name }]} />
    <header className="archive-header"><p className="eyebrow">Conteúdos</p><h1>{name}</h1></header>
    <section className="post-list">
      {result.data.map(post => <article key={post.id}>
        <p className="eyebrow">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(post.date))}</p>
        <h2><Link href={`/${post.slug}/`}>{plainText(post.title.rendered)}</Link></h2>
        <p>{excerpt(post.excerpt.rendered)}</p>
      </article>)}
      {!result.data.length ? <p>Nenhum conteúdo encontrado.</p> : null}
    </section>
    <Pagination page={page} hasNextPage={page < result.totalPages} basePath={basePath} />
    <JsonLd data={breadcrumbSchema([{ name: "Início", pathname: "/" }, { name, pathname: basePath }])} />
  </div>;
}

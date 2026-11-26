import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Catalog } from "@/components/catalog";
import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { parseTagArchive } from "@/lib/archive-path";
import { catalogSearch, parseCatalogQuery, type SearchValues } from "@/lib/catalog-query";
import { canonicalizeEthnicityNames } from "@/lib/ethnicity-colors";
import { excerpt, plainText } from "@/lib/html";
import { breadcrumbSchema, createMetadata } from "@/lib/seo";
import { getProductTagBySlug } from "@/lib/woocommerce";

export const revalidate = 900;
type Props = { params: Promise<{ slug: string[] }>; searchParams: Promise<SearchValues> };

async function resolve(params: Props["params"]) {
  const parsed = parseTagArchive((await params).slug, "product-tag");
  if (!parsed) notFound();
  const tag = await getProductTagBySlug(parsed.slug);
  if (!tag || (parsed.page > 1 && (parsed.page - 1) * 12 >= tag.count)) notFound();
  return { ...parsed, tag, name: canonicalizeEthnicityNames(plainText(tag.name)) };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { tag, name, page, pathname } = await resolve(params);
  return createMetadata({
    title: page > 1 ? `${name} — Página ${page}` : name,
    description: excerpt(tag.description) || `Conheça os produtos de ${name} na Medicina Sagrada.`,
    pathname,
    noIndex: catalogSearch(parseCatalogQuery(await searchParams)).size > 0,
  });
}

export default async function ProductTagPage({ params, searchParams }: Props) {
  const { tag, name, page, basePath } = await resolve(params);
  return <div className="container content-page">
    <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: name }]} />
    <header className="archive-header">
      <p className="eyebrow">Produtos</p><h1>{name}</h1>
      {page === 1 ? <RichText html={tag.description} removeHeadings /> : null}
    </header>
    <Catalog query={parseCatalogQuery(await searchParams)} tagId={tag.id} page={page} basePath={basePath} />
    <JsonLd data={breadcrumbSchema([{ name: "Início", pathname: "/" }, { name, pathname: basePath }])} />
  </div>;
}

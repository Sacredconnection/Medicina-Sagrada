import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Catalog } from "@/components/catalog";
import { parseCatalogQuery, type SearchValues } from "@/lib/catalog-query";

type Props = { searchParams: Promise<SearchValues> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = parseCatalogQuery(await searchParams);
  return { title: q ? `Busca por “${q}”` : "Todos os produtos", robots: { index: false, follow: true } };
}
export default async function SearchPage({ searchParams }: Props) {
  const query = parseCatalogQuery(await searchParams);
  return <div className="container content-page search-page">
    <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Busca" }]} />
    <header className="archive-header search-header"><p className="eyebrow">Explore a loja</p><h1>{query.q ? `Resultados para “${query.q}”` : "Todos os produtos"}</h1>
      <form className="search-form" action="/busca/" method="get" role="search"><label className="sr-only" htmlFor="catalog-search">Buscar produtos</label><input className="search-input" id="catalog-search" name="q" type="search" defaultValue={query.q} placeholder="O que você procura?" maxLength={80} /><button className="commerce-button">Buscar</button></form>
    </header>
    <Catalog query={query} basePath="/busca/" />
  </div>;
}

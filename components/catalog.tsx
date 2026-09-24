import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogFilters, CatalogSort } from "@/components/catalog-filters";
import { ProductCard } from "@/components/product-card";
import { catalogSearch, type CatalogQuery } from "@/lib/catalog-query";
import { getAllProductCategories, getCatalog } from "@/lib/woocommerce";

export async function Catalog({ query, basePath, categoryId, page = query.page }: { query: CatalogQuery; basePath: string; categoryId?: number; page?: number }) {
  const [result, categories] = await Promise.all([getCatalog(query, categoryId, page), getAllProductCategories()]);
  if (categoryId && page > 1 && !result.data.length) notFound();
  const params = catalogSearch(query);
  const href = (target: number) => {
    const next = new URLSearchParams(params);
    if (!categoryId && target > 1) next.set("pagina", String(target));
    const path = categoryId && target > 1 ? `${basePath}page/${target}/` : basePath;
    return `${path}${next.size ? `?${next}` : ""}`;
  };
  return <div className="catalog-layout">
    <CatalogFilters key={params.toString()} query={query} basePath={basePath} categories={categories} categoryId={categoryId} />
    <div className="catalog-results">
      <div className="catalog-toolbar"><p>{result.total} {result.total === 1 ? "produto encontrado" : "produtos encontrados"}{result.data.length ? ` · ${((page - 1) * 12) + 1}–${((page - 1) * 12) + result.data.length}` : ""}</p><CatalogSort key={params.toString()} value={query.sort} /></div>
      {query.invalidPrice ? <p className="commerce-error" role="alert">Informe preços válidos, com o mínimo menor ou igual ao máximo. O filtro de preço não foi aplicado.</p> : null}
      <div className="catalog-active-filters" aria-label="Filtros aplicados">{[["estoque", query.stock ? "Em estoque" : ""], ["oferta", query.sale ? "Em oferta" : ""], ["min", query.min !== undefined ? `A partir de R$ ${query.min / 100}` : ""], ["max", query.max !== undefined ? `Até R$ ${query.max / 100}` : ""]].map(([key, label]) => { const next = new URLSearchParams(params); next.delete(key); return label ? <Link key={key} href={`${basePath}?${next}`} aria-label={`Remover filtro ${label}`}>{label} ×</Link> : null; })}</div>
      {result.data.length ? <section className="product-grid" aria-label="Produtos encontrados">{result.data.map(product => <ProductCard key={product.id} product={product} />)}</section> : <div className="catalog-empty"><h2>Nenhum produto encontrado</h2><p>Tente outra busca ou remova alguns filtros.</p><Link href={basePath} className="commerce-text-button">Recomeçar a busca</Link></div>}
      {page > 1 || page < result.totalPages ? <nav className="pagination" aria-label="Paginação de produtos">{page > 1 ? <Link href={href(page - 1)}>Página anterior</Link> : <span />}<span aria-current="page">Página {page}{result.totalPages ? ` de ${result.totalPages}` : ""}</span>{page < result.totalPages ? <Link href={href(page + 1)}>Próxima página</Link> : <span />}</nav> : null}
    </div>
  </div>;
}

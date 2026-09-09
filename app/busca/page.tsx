import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/woocommerce";

export const revalidate = 900;

const PRODUCTS_PER_PAGE = 24;

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    pagina?: string | string[];
  }>;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const normalizeQuery = (value: string | string[] | undefined) =>
  (firstValue(value) ?? "").trim().slice(0, 80);

const normalizePage = (value: string | string[] | undefined) => {
  const parsed = Number(firstValue(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = normalizeQuery((await searchParams).q);

  return {
    title: query ? `Busca por “${query}”` : "Busca",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = normalizeQuery(resolvedSearchParams.q);
  const page = normalizePage(resolvedSearchParams.pagina);
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let requestFailed = false;

  if (query) {
    try {
      products = await getProducts({
        search: query,
        page,
        perPage: PRODUCTS_PER_PAGE,
      });
    } catch {
      requestFailed = true;
    }
  }

  const pageHref = (value: number) => {
    const params = new URLSearchParams({ q: query });
    if (value > 1) params.set("pagina", String(value));
    return `/busca/?${params.toString()}`;
  };

  return (
    <div className="container content-page search-page">
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Busca" }]} />

      <header className="archive-header search-header">
        <p className="eyebrow">Busca no catálogo</p>
        <h1>{query ? `Resultados para “${query}”` : "O que você procura?"}</h1>
        <form className="search-form" action="/busca/" method="get" role="search">
          <label className="sr-only" htmlFor="catalog-search">
            Buscar produtos
          </label>
          <input
            className="search-input"
            id="catalog-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Digite o nome de um produto"
            maxLength={80}
            required
          />
          <button className="button button-solid" type="submit">
            Buscar
          </button>
        </form>
      </header>

      {requestFailed ? (
        <section className="search-feedback" role="alert">
          <h2>Não foi possível concluir a busca.</h2>
          <p>Tente novamente em alguns instantes.</p>
        </section>
      ) : query && products.length ? (
        <>
          <p className="search-summary">
            Produtos encontrados para “{query}”
          </p>
          <section className="product-grid" aria-label={`Resultados para ${query}`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>

          {(page > 1 || products.length === PRODUCTS_PER_PAGE) && (
            <nav className="pagination" aria-label="Paginação da busca">
              {page > 1 ? (
                <Link href={pageHref(page - 1)}>Página anterior</Link>
              ) : (
                <span />
              )}
              <span aria-current="page">Página {page}</span>
              {products.length === PRODUCTS_PER_PAGE ? (
                <Link href={pageHref(page + 1)}>Próxima página</Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      ) : query ? (
        <section className="search-feedback">
          <h2>Nenhum produto encontrado.</h2>
          <p>Tente outro nome ou uma expressão mais curta.</p>
        </section>
      ) : (
        <p className="search-hint">
          Digite o nome do produto, medicina ou categoria que deseja encontrar.
        </p>
      )}
    </div>
  );
}

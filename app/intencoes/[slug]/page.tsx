import Link from "next/link";
import { notFound } from "next/navigation";
import { getIntention, intentions } from "@/lib/intencoes";
import { getAllProducts } from "@/lib/woocommerce";
import { ProductCard } from "@/components/product-card";

export const dynamicParams = false;
export const revalidate = 900;

export function generateStaticParams() {
  return intentions.map(({ slug }) => ({ slug }));
}

type IntentionPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: IntentionPageProps) {
  const { slug } = await params;
  const intention = getIntention(slug);
  return intention ? {
    title: `${intention.name} | Intenções | Medicina Sagrada`,
    description: intention.meaning,
  } : {};
}

export default async function IntentionPage({ params }: IntentionPageProps) {
  const { slug } = await params;
  const intention = getIntention(slug);
  if (!intention) notFound();
  const index = intentions.findIndex((item) => item.slug === slug);
  const previous = intentions[(index - 1 + intentions.length) % intentions.length];
  const next = intentions[(index + 1) % intentions.length];
  const productsResult = await getAllProducts().then((products) => ({ products, failed: false as const })).catch(() => ({ products: [], failed: true as const }));
  const products = productsResult.products.filter((product) =>
    product.attributes?.some((attribute) =>
      (attribute.taxonomy === "pa_intencao-principal" || attribute.taxonomy === "pa_intencoes-secundarias") &&
      attribute.terms.some((term) => term.slug === intention.slug),
    ),
  );

  return (
    <main className="intentions-page container">
      <nav className="intentions-breadcrumb" aria-label="Navegação estrutural">
        <Link href="/">Início</Link><span aria-hidden="true">/</span><Link href="/intencoes/">Intenções</Link><span aria-hidden="true">/</span><span>{intention.name}</span>
      </nav>
      <article className="intention-detail">
        <p className="eyebrow">Tema editorial</p>
        <h1>{intention.name}</h1>
        <p className="intention-detail-lede">{intention.meaning}</p>
        <details className="intention-context">
          <summary>Sobre esta intenção</summary>
        <section aria-labelledby="contexto-title">
          <h2 id="contexto-title">Como ler esta classificação</h2>
          <p>{intention.character}</p>
        </section>
        <section aria-labelledby="fontes-title">
          <h2 id="fontes-title">Fontes e revisão</h2>
          <p>As classificações dos produtos exibidos foram associadas por SKU e revisadas com base nas fontes registradas no cadastro. Elas descrevem a linguagem dessas fontes.</p>
        </section>
        <aside className="intention-editorial-note">
          <h2>Intenção e intensidade são coisas diferentes</h2>
          <p>Este tema descreve como um preparo é apresentado nas fontes editoriais. A intensidade só deve ser informada quando houver uma fonte identificada e revisada. Nenhuma das duas informações, isoladamente, indica segurança ou resultado.</p>
        </aside>
        </details>
      </article>
      <section className="intention-products" aria-labelledby="intention-products-title">
        <div className="section-heading">
          <p className="eyebrow">Catálogo</p>
          <h2 id="intention-products-title">{productsResult.failed ? "Produtos associados" : `${products.length} ${products.length === 1 ? "produto associado" : "produtos associados"}`}</h2>
        </div>
        {productsResult.failed ? (
          <div className="catalog-empty" role="status">
            <h3>Não foi possível carregar os produtos</h3>
            <p>Tente novamente em alguns instantes.</p>
            <a className="commerce-text-button" href={`/intencoes/${slug}/`}>Tentar novamente</a>
          </div>
        ) : products.length ? (
          <div className="product-grid" aria-label={`Produtos associados a ${intention.name}`}>
            {products.map((product) => <ProductCard key={product.id} product={product} intentionSlug={slug} />)}
          </div>
        ) : (
          <div className="catalog-empty"><h3>Nenhum produto associado</h3><p>Novos produtos aparecem aqui quando recebem uma classificação revisada.</p></div>
        )}
      </section>
      <nav className="intention-pager" aria-label="Navegar entre temas">
        <Link href={`/intencoes/${previous.slug}/`}><span>← Tema anterior</span><strong>{previous.name}</strong></Link>
        <Link href="/intencoes/"><span>Todos os temas</span><strong>Índice de intenções</strong></Link>
        <Link href={`/intencoes/${next.slug}/`}><span>Próximo tema →</span><strong>{next.name}</strong></Link>
      </nav>
    </main>
  );
}

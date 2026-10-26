import Link from "next/link";
import { notFound } from "next/navigation";
import { getIntention, intentions } from "@/lib/intencoes";
import { getAllProducts } from "@/lib/woocommerce";
import { ProductCard } from "@/components/product-card";
import { IntentionSidebar } from "@/components/intention-sidebar";

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
      <nav className="intentions-breadcrumb" aria-label="Você está aqui">
        <Link href="/">Início</Link><span aria-hidden="true">/</span><Link href="/intencoes/">Intenções</Link><span aria-hidden="true">/</span><span>{intention.name}</span>
      </nav>
      <div className="intention-layout">
        <article className="intention-detail">
          <h1>{intention.name}</h1>
          <p className="intention-detail-lede">{intention.meaning}</p>
        </article>
        <IntentionSidebar currentSlug={slug} />
        <section className="intention-products" aria-labelledby="intention-products-title">
          <div className="section-heading">
            <p className="eyebrow">Catálogo</p>
            <h2 id="intention-products-title">{productsResult.failed ? "Produtos" : `${products.length} ${products.length === 1 ? "produto" : "produtos"}`}</h2>
          </div>
          {productsResult.failed ? (
            <div className="catalog-empty" role="status">
              <h3>Não foi possível carregar os produtos</h3>
              <p>Tente novamente em alguns instantes.</p>
              <a className="commerce-text-button" href={`/intencoes/${slug}/`}>Tentar novamente</a>
            </div>
          ) : products.length ? (
            <div className="product-grid" aria-label={`Produtos relacionados a ${intention.name}`}>
              {products.map((product) => <ProductCard key={product.id} product={product} intentionSlug={slug} />)}
            </div>
          ) : (
            <div className="catalog-empty"><h3>Ainda não há produtos nesta intenção</h3><p>Explore as outras intenções para conhecer mais produtos.</p><Link href="/intencoes/" className="commerce-text-button">Ver outras intenções</Link></div>
          )}
        </section>
        <nav className="intention-pager" aria-label="Explore outras intenções">
          <Link href={`/intencoes/${previous.slug}/`}><span>← Intenção anterior</span><strong>{previous.name}</strong></Link>
          <Link href="/intencoes/"><span>Continue explorando</span><strong>Todas as intenções</strong></Link>
          <Link href={`/intencoes/${next.slug}/`}><span>Próxima intenção →</span><strong>{next.name}</strong></Link>
        </nav>
      </div>
    </main>
  );
}

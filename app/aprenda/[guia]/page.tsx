import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LearnArrow } from "@/components/learn-arrow";
import { ProductCard } from "@/components/product-card";
import { LearnImageSlot, hasLearnImage } from "@/components/learn-image-slot";
import { getLearnGuide, learnGuides } from "@/lib/learn-content";
import { createMetadata } from "@/lib/seo";
import { getAllProductCategories, getProducts } from "@/lib/woocommerce";

export const revalidate = 900;
export const dynamicParams = false;
type Props = { params: Promise<{ guia: string }> };
const titleHighlights: Record<string, string> = { "primeiro-rape": "origem", "escolher-aplicador": "a diferença", "preparar-com-cuidado": "simples" };
function GuideTitle({ title, slug }: { title: string; slug: string }) {
  const highlight = titleHighlights[slug];
  const start = title.indexOf(highlight);
  return <>{title.slice(0, start)}<em>{highlight}</em>{title.slice(start + highlight.length)}</>;
}
export const generateStaticParams = () => learnGuides.map((guide) => ({ guia: guide.slug }));

export async function generateMetadata({ params }: Props) {
  const guide = getLearnGuide((await params).guia);
  if (!guide) return { title: "Guia não encontrado", robots: { index: false, follow: false } };
  const image = `/assets/aprenda/guias/${guide.slug}/passo-01.webp`;
  return createMetadata({ title: guide.label, description: guide.summary, pathname: `/aprenda/${guide.slug}/`, type: "article", image: hasLearnImage(image) ? image : undefined });
}

export default async function LearnGuidePage({ params }: Props) {
  const guide = getLearnGuide((await params).guia);
  if (!guide) notFound();
  const next = learnGuides[(learnGuides.indexOf(guide) + 1) % learnGuides.length];
  const compact = guide.slug === "primeiro-rape";
  const categories = compact ? [] : await getAllProductCategories().catch(() => []);
  const collectionSlugs = guide.collection === "essenciais" ? ["rape", "aplicadores"] : [guide.collection];
  const selections = await Promise.all(collectionSlugs.map(async (slug) => {
    const category = categories.find((item) => item.slug === slug);
    if (!category) return [];
    const products = await getProducts({ categoryId: category.id, perPage: 24 }).catch(() => []);
    return products.filter((item) => item.is_in_stock !== false && !/\bkits?\b/i.test(item.name) && !item.categories.some((category) => category.slug === "kits")).slice(0, guide.collection === "essenciais" ? 2 : 4);
  }));
  const products = [...new Map(selections.flat().map((product) => [product.id, product])).values()];
  const collectionHref = guide.collection === "aplicadores" ? "/product-category/acessorios/aplicadores/" : "/product-category/rape/";
  return <div className={compact ? "learn-first-guide" : undefined}>
    <article>
      <header className="learn-reading-shell learn-intro learn-article-intro"><Breadcrumbs items={[{ label: "Aprenda", href: "/aprenda/" }, { label: guide.label }]} /><div className="learn-intro-grid"><div><p className="learn-label">Guia {String(learnGuides.indexOf(guide) + 1).padStart(2, "0")} · {guide.label}</p><h1><GuideTitle title={guide.title} slug={guide.slug} /></h1></div><p className="learn-article-introduction">{guide.introduction}</p></div></header>
      <div className="learn-reading-shell learn-article-steps">
        <aside className="learn-checklist" aria-labelledby="learn-checklist-title">{!compact ? <p className="learn-label">Antes de escolher</p> : null}<h2 id="learn-checklist-title">{compact ? "Antes de escolher, confira:" : "Um checklist simples."}</h2><ul>{guide.checklist.map((item) => <li key={item}><span aria-hidden="true" />{item}</li>)}</ul></aside>
        <div className={compact ? "learn-steps-grid" : undefined}>{guide.sections.map((section, index) => <section className="learn-article-step" key={section.title} aria-labelledby={`passo-${index + 1}`}>{!compact || hasLearnImage(`/assets/aprenda/guias/${guide.slug}/passo-${String(index + 1).padStart(2, "0")}.webp`) ? <LearnImageSlot src={`/assets/aprenda/guias/${guide.slug}/passo-${String(index + 1).padStart(2, "0")}.webp`} alt={section.alt} className="learn-article-image" /> : null}<div className="learn-article-copy"><p className="learn-label">Passo {String(index + 1).padStart(2, "0")}</p><h2 id={`passo-${index + 1}`}>{section.title}</h2><p>{section.body}</p></div></section>)}</div>
      </div>
    </article>
    <section className="learn-recommendations" aria-labelledby="learn-collection-title"><div className={compact ? "learn-reading-shell" : "learn-shell"}><div className="learn-recommendation-heading">{compact ? <><div className="learn-collection-intro"><h2 id="learn-collection-title">{guide.collectionTitle}</h2><p>{guide.collectionCopy}</p><Link className="learn-nav-link learn-nav-next" href={collectionHref}>Explorar todos os rapés<LearnArrow /></Link></div><LearnImageSlot src="/assets/aprenda/banners/continue-aprendendo-foto.webp" alt="Três mulheres indígenas com adornos e pinturas corporais em uma construção de cobertura de palha" className="learn-collection-photo" /></> : <><div><p className="learn-label">Quando quiser explorar</p><h2 id="learn-collection-title">{guide.collectionTitle}</h2></div><p>{guide.collectionCopy}</p></>}</div>{!compact && (products.length ? <div className="product-grid">{products.map((product) => {
      const src = `/assets/aprenda/produtos/${product.slug}.webp`;
      const images = hasLearnImage(src) ? [{ ...(product.images[0] ?? { id: product.id, name: product.name, alt: product.name }), src }] : [];
      return <ProductCard key={product.id} product={{ ...product, images }} headingLevel={3} />;
    })}</div> : <p>Consulte as coleções para conhecer as peças e preparações disponíveis.</p>)}<div className={`learn-collection-links${compact ? " learn-collection-links-compact" : ""}`}><Link className="learn-nav-link" href={collectionHref}>{guide.collection === "aplicadores" ? "Ver todos os aplicadores" : "Ver todos os rapés"}<LearnArrow /></Link>{guide.collection === "essenciais" ? <Link className="learn-nav-link" href="/product-category/acessorios/aplicadores/">Ver os aplicadores<LearnArrow /></Link> : null}</div></div></section>
    <nav className="learn-reading-shell learn-guide-navigation" aria-label="Continue nos guias"><Link className="learn-nav-link" href="/aprenda/"><LearnArrow back />Todos os guias</Link><Link className="learn-nav-link learn-nav-next" href={`/aprenda/${next.slug}/`}><span>Próximo: {next.label}</span><LearnArrow /></Link></nav>
  </div>;
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LearnImageSlot, hasLearnImage } from "@/components/learn-image-slot";
import { getLearnGuide, learnGuides } from "@/lib/learn-content";
import { createMetadata } from "@/lib/seo";

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
  const collectionHref = guide.collection === "aplicadores" ? "/product-category/acessorios/aplicadores/" : "/product-category/rape/";
  return <div className={`learn-guide-article${guide.slug === "primeiro-rape" ? " learn-first-guide" : ""}`}>
    <article>
      <header className="learn-reading-shell learn-intro learn-article-intro"><Breadcrumbs items={[{ label: "Aprenda", href: "/aprenda/" }, { label: guide.label }]} /><div className="learn-intro-grid"><div><p className="learn-label">Guia {String(learnGuides.indexOf(guide) + 1).padStart(2, "0")} · {guide.label}</p><h1><GuideTitle title={guide.title} slug={guide.slug} /></h1></div><p className="learn-article-introduction">{guide.introduction}</p></div></header>
      <div className="learn-reading-shell learn-article-steps">
        <aside className="learn-checklist" aria-labelledby="learn-checklist-title"><h2 id="learn-checklist-title">Antes de escolher, confira:</h2><ul>{guide.checklist.map((item) => <li key={item}><span aria-hidden="true" />{item}</li>)}</ul></aside>
        <div className="learn-steps-grid">{guide.sections.map((section, index) => <section className="learn-article-step" key={section.title} aria-labelledby={`passo-${index + 1}`}>{hasLearnImage(`/assets/aprenda/guias/${guide.slug}/passo-${String(index + 1).padStart(2, "0")}.webp`) ? <LearnImageSlot src={`/assets/aprenda/guias/${guide.slug}/passo-${String(index + 1).padStart(2, "0")}.webp`} alt={section.alt} className="learn-article-image" /> : null}<div className="learn-article-copy"><p className="learn-label">Passo {String(index + 1).padStart(2, "0")}</p><h2 id={`passo-${index + 1}`}>{section.title}</h2><p>{section.body}</p></div></section>)}</div>
      </div>
    </article>
    <section className="learn-recommendations" aria-labelledby="learn-collection-title"><div className="learn-reading-shell"><div className="learn-recommendation-heading"><div className="learn-collection-intro"><h2 id="learn-collection-title">{guide.collectionTitle}</h2><p>{guide.collectionCopy}</p><Link className="button" href={collectionHref}>{guide.collection === "aplicadores" ? "Explorar todos os aplicadores" : "Explorar todos os rapés"}</Link>{guide.collection === "essenciais" ? <Link className="button" href="/product-category/acessorios/aplicadores/">Explorar os aplicadores</Link> : null}</div><LearnImageSlot src="/assets/aprenda/banners/continue-aprendendo-foto.webp" alt="Três mulheres indígenas com adornos e pinturas corporais em uma construção de cobertura de palha" className="learn-collection-photo" /></div></div></section>
    <nav className="learn-reading-shell learn-guide-navigation" aria-label="Continue nos guias"><Link className="text-link" href="/aprenda/">Todos os guias</Link><Link className="text-link" href={`/aprenda/${next.slug}/`}><span>Próximo: {next.label}</span></Link></nav>
  </div>;
}

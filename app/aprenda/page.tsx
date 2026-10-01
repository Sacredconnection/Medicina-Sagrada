import Link from "next/link";
import { LearnImageSlot } from "@/components/learn-image-slot";
import { LearnPeopleGrid } from "@/components/learn-people-grid";
import { ethnicityThemes } from "@/lib/ethnicity-colors";
import { learnGuides, learnPeople } from "@/lib/learn-content";
import { createMetadata } from "@/lib/seo";
import { getAllProductCategories } from "@/lib/woocommerce";
import { pathnameFromUrl } from "@/lib/url";

export const revalidate = 900;
export const metadata = createMetadata({ title: "Aprenda: primeiros passos", description: "Conheça o rapé, os aplicadores tradicionais e os povos por trás das preparações. Guias para começar com respeito e consciência.", pathname: "/aprenda/" });

export default async function LearnPage() {
  const categories = await getAllProductCategories().catch(() => []);
  const entries = learnPeople.map((person) => {
    const theme = ethnicityThemes.find((item) => item.name === person.name)!;
    const category = categories.find((item) => theme.aliases.includes(item.slug));
    return { ...person, accent: theme.accent, foreground: theme.foreground, href: category ? pathnameFromUrl(category.permalink) : "/product-category/rape/", media: <LearnImageSlot src={`/assets/aprenda/povos/${person.slug}.webp`} className="learn-person-media" alt={`Imagem de contexto de ${person.name}`} /> };
  });
  return <>
    <header className="learn-shell learn-intro learn-intro-home"><div className="learn-intro-grid"><div><p className="learn-label">Primeira vez? · Comece aqui</p><h1>Comece pelo{" "}<br /><em>conhecimento.</em></h1></div><div className="learn-intro-copy"><p>Você não precisa conhecer todas as tradições nem escolher tudo de uma vez. Entenda a preparação, o aplicador e o contexto antes de dar seus primeiros passos.</p><p>Explore os guias no seu tempo. Conhecer também é uma forma de respeito.</p></div></div></header>
    <section className="learn-first-steps" aria-labelledby="learn-guides-title">
      <LearnImageSlot src="/assets/aprenda/banners/primeiros-passos-desktop.webp" mobileSrc="/assets/aprenda/banners/primeiros-passos-mobile.webp" className="learn-background" />
      <div className="learn-shell learn-first-steps-content"><div className="learn-section-heading"><p className="learn-label">Três primeiros passos</p><h2 id="learn-guides-title">Aprenda antes de escolher.</h2></div>
        <div className="learn-guides-grid">{learnGuides.map((guide) => <Link href={`/aprenda/${guide.slug}/`} className="learn-guide-card" key={guide.slug}><p className="learn-label">{guide.label}</p><h3>{guide.title}</h3><p>{guide.summary}</p><span className="learn-card-action">Ler o guia</span></Link>)}</div>
      </div>
    </section>
    <section className="learn-shell learn-people" aria-labelledby="learn-people-title"><div className="learn-intro-grid learn-people-heading"><div><p className="learn-label">Enciclopédia dos povos</p><h2 id="learn-people-title">Conheça os povos por trás de cada medicina</h2></div><div><p>Um nome pode apontar para um povo, um território ou uma tradição regional. Conheça um pouco desse contexto sem reduzir uma cultura a um efeito prometido.</p><p>Explore cada povo e continue a leitura nos cards abaixo.</p></div></div>
      <LearnPeopleGrid entries={entries} />
      <div className="learn-context-note"><p>Este é um ponto de partida, não um retrato completo de cada cultura. Os nomes, as histórias e as identidades devem respeitar como as próprias comunidades se apresentam.</p></div>
    </section>
    <section className="learn-continue"><LearnImageSlot src="/assets/aprenda/banners/continue-aprendendo-desktop.webp" mobileSrc="/assets/aprenda/banners/continue-aprendendo-mobile.webp" className="learn-background" /><div className="learn-shell"><div className="learn-continue-copy"><p className="learn-label">Continue aprendendo</p><h2>Há histórias que{" "}<br />um guia não conta.</h2><p>Aprofunde seu olhar sobre as tradições, os objetos e os saberes da floresta no nosso blog.</p><Link className="learn-blog-button" href="/blog/">Visite o blog</Link></div></div></section>
  </>;
}

import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/url";

const categories = [
  {
    href: "/product-category/rape/",
    name: "Rapé",
    description: "Receitas de diferentes etnias e tradições.",
  },
  {
    href: "/product-category/sananga/",
    name: "Sananga",
    description: "Conhecimento tradicional e uso consciente.",
  },
  {
    href: "/product-category/incensos/",
    name: "Incensos",
    description: "Aromas naturais para momentos de presença.",
  },
  {
    href: "/product-category/artesanato/",
    name: "Artesanato",
    description: "Arte, memória e expressão dos povos da floresta.",
  },
];

export default function Home() {
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl("/")}#webpage`,
    url: absoluteUrl("/"),
    name: "Medicina Sagrada",
    inLanguage: "pt-BR",
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">Saberes da floresta</p>
          <h1>Conhecimento ancestral, vivo e compartilhado com respeito.</h1>
          <p className="hero-copy">
            Medicinas, arte e cultura das populações indígenas e tradicionais
            do Brasil.
          </p>
          <Link className="button" href="/product-category/rape/">
            Conheça as medicinas
          </Link>
        </div>
      </section>

      <section className="section container" aria-labelledby="categorias-title">
        <div className="section-heading">
          <p className="eyebrow">Explore</p>
          <h2 id="categorias-title">Caminhos de conhecimento</h2>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <article className="category-card" key={category.href}>
              <h3>
                <Link href={category.href}>{category.name}</Link>
              </h3>
              <p>{category.description}</p>
              <Link className="text-link" href={category.href}>
                Ver categoria <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
      <JsonLd data={pageSchema} />
    </>
  );
}

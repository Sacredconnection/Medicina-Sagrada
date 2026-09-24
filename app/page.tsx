import Link from "next/link";
import type { CSSProperties } from "react";
import { BenefitsStrip } from "@/components/benefits-strip";
import { HomeKitsSection } from "@/components/home-kit-grid";
import { HomeProductGrid } from "@/components/home-product-grid";
import { JsonLd } from "@/components/json-ld";
import { LiveHero } from "@/components/live-hero";
import { ProductMatcher } from "@/components/product-matcher";
import { getAllProducts } from "@/lib/woocommerce";
import {
  demoProducts,
  editorialBanners,
  getHomeKitBanners,
  homeAssets,
  homeCategories,
} from "@/lib/home-content";
import { absoluteUrl } from "@/lib/url";

export const revalidate = 900;

export default async function Home() {
  const apiProducts = await getAllProducts().catch(() => []);
  const products = apiProducts.length ? apiProducts : demoProducts;
  const rotatingKitBanners = getHomeKitBanners(apiProducts);
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl("/")}#webpage`,
    url: absoluteUrl("/"),
    name: "Medicina Sagrada",
    inLanguage: "pt-BR",
  };
  const heroSlides = [
    {
      id: "ancestralidade",
      desktopImage: homeAssets.hero.desktopImage,
      mobileImage: homeAssets.hero.mobileImage,
      titlePrimary: "Conhecimento ancestral,",
      titleSecondary: "vivo e compartilhado com respeito.",
      description:
        "Medicinas indígenas autênticas: rapés, kuripes e tepis tradicionais, diretamente das comunidades da Amazônia.",
      ctaLabel: "JORNADA",
      ctaHref: "/product-category/rape/",
    },
    {
      id: "acessorios-kuripe-tepi",
      desktopImage: homeAssets.hero.accessoriesDesktopImage,
      mobileImage: homeAssets.hero.accessoriesMobileImage,
      fallbackDesktopImage: homeAssets.hero.desktopImage,
      fallbackMobileImage: homeAssets.hero.mobileImage,
      titlePrimary: "Kuripes\n& Tepis:",
      titleSecondary: "Instrumentos Sagrados de Sopro.",
      description:
        "Seja para a autoaplicação ou para conduzir o sopro em rituais, descubra nossos aplicadores confeccionados com intenção e respeito à medicina.",
      ctaLabel: "VER ACESSÓRIOS",
      ctaHref: "/product-category/acessorios/",
    },
  ];

  return (
    <>
      <LiveHero slides={heroSlides} />

      <BenefitsStrip />

      <section className="category-rail-wrap" aria-labelledby="categorias-title">
        <div className="container">
          <div className="section-heading category-rail-heading">
            <h2 id="categorias-title">Nossas Categorias</h2>
            <p className="category-rail-subtitle">
              Tradição e respeito: medicinas e artesanatos originais, direto das aldeias.
            </p>
          </div>
          <div className="category-rail-shell">
            <span className="category-scroll-cue category-scroll-cue-prev" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="m14.5 6-6 6 6 6" />
              </svg>
            </span>
            <div className="category-rail">
              {homeCategories.map((category) => (
                <Link className="category-tile" href={category.href} key={category.href}>
                  <span className="category-tile-image">
                    <img src={category.image} alt="" />
                  </span>
                  <span className="category-tile-name">{category.name}</span>
                  <span className="category-tile-detail">{category.detail}</span>
                  <span className="category-tile-cta">Ver produtos</span>
                </Link>
              ))}
            </div>
            <span className="category-scroll-cue category-scroll-cue-next" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="m9.5 6 6 6-6 6" />
              </svg>
            </span>
          </div>
        </div>
      </section>

      <ProductMatcher products={products} />

      <section className="products-section" aria-labelledby="mais-vendidos-title">
        <div className="container">
          <div className="section-heading section-heading-inline">
            <div>
              <p className="eyebrow">Recomendações da Medicina Sagrada</p>
              <h2 id="mais-vendidos-title">Mais procurados</h2>
            </div>
          </div>
          <HomeProductGrid products={products} />
          <div className="products-section-action">
            <Link className="button" href="/product-category/rape/">
              Ver todos os produtos
            </Link>
          </div>
        </div>
      </section>

      <HomeKitsSection banners={rotatingKitBanners} />

      <section className="section container" aria-labelledby="editoriais-title">
        <div className="section-heading section-heading-inline">
          <div>
            <p className="eyebrow">Escolhas para o seu caminho</p>
            <h2 id="editoriais-title">Objetos, aromas e presença</h2>
          </div>
          <p className="section-note">Uma curadoria para acompanhar seus momentos de cuidado.</p>
        </div>
        <div className="editorial-grid">
          {editorialBanners.map((banner) => (
            <Link
              className={`editorial-card editorial-card-${banner.tone}`}
              href={banner.href}
              key={banner.href}
              style={{ "--card-image": `url(${banner.image})` } as CSSProperties}
            >
              <span className="eyebrow">{banner.eyebrow}</span>
              <h3>{banner.title}</h3>
              <span className="editorial-link">{banner.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="story-section container" aria-labelledby="story-title">
        <div className="story-image" style={{ "--story-image": `url(${homeAssets.story.image})` } as CSSProperties}>
          <span>Desde 2018</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow">A nossa forma de caminhar</p>
          <h2 id="story-title">Conhecimento vivo, relações de respeito.</h2>
          <p>
            A Medicina Sagrada valoriza e promove conhecimentos ancestrais de
            medicinas, arte e cultura das populações indígenas e tradicionais
            do Brasil, gerando renda para suas comunidades.
          </p>
          <p>
            Cada produto carrega uma história. Nosso compromisso é compartilhar
            esses saberes com cuidado, reconhecendo o protagonismo de seus povos.
          </p>
          <Link className="text-link" href="/sobre-nos/">
            Conheça a Medicina Sagrada
          </Link>
        </div>
      </section>

      <section className="community-section" aria-labelledby="community-title">
        <div className="container community-inner">
          <div>
            <p className="eyebrow">Continue a conversa</p>
            <h2 id="community-title">Aprenda, escute e se aproxime.</h2>
            <p>
              Conteúdos para aprofundar o conhecimento sobre as medicinas e as
              histórias dos povos que as mantêm vivas.
            </p>
          </div>
          <Link className="button button-outline" href="/atendimento/">
            Fale com a gente
          </Link>
        </div>
      </section>

      <JsonLd data={pageSchema} />
    </>
  );
}

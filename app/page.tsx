import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { BenefitsStrip } from "@/components/benefits-strip";
import { HomeApplicatorsSection } from "@/components/home-applicators-section";
import { HomeConexaoAncestralSection } from "@/components/home-conexao-ancestral-section";
import { HomeCraftsSection } from "@/components/home-crafts-section";
import { HomeKitsSection } from "@/components/home-kit-grid";
import { HomeNewsletterSection } from "@/components/home-newsletter-section";
import { HomeProductGrid } from "@/components/home-product-grid";
import { HomeYoutubeSection } from "@/components/home-youtube-section";
import { JsonLd } from "@/components/json-ld";
import { LiveHero } from "@/components/live-hero";
import { ProductMatcher } from "@/components/product-matcher";
import { toRitualCatalog } from "@/lib/ritual-catalog";
import { getAllProducts } from "@/lib/woocommerce";
import { getYouTubeVideos } from "@/lib/youtube";
import {
  demoProducts,
  getHomeKitBanners,
  homeAssets,
  homeCategories,
} from "@/lib/home-content";
import { absoluteUrl } from "@/lib/url";
import { config } from "@/lib/config";
import { createMetadata } from "@/lib/seo";

export const revalidate = 900;

export const metadata = {
  ...createMetadata({
    title: "Medicina Sagrada",
    description: "Medicinas, arte e cultura dos povos indígenas e tradicionais do Brasil.",
    pathname: "/",
    image: new URL(homeAssets.hero.desktopImage, config.siteUrl).toString(),
  }),
  title: { absolute: "Medicina Sagrada" },
};

export default async function Home() {
  const [apiProducts, youtubeVideos] = await Promise.all([
    getAllProducts().catch(() => []),
    getYouTubeVideos(),
  ]);
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
      titlePrimary: "Saberes da floresta,",
      titleSecondary: "vivos e compartilhados com respeito.",
      description:
        "Medicinas indígenas autênticas: rapés, kuripes e tepis tradicionais, diretamente das comunidades da Amazônia.",
      ctaLabel: "CONHEÇA AS MEDICINAS",
      ctaHref: "/product-category/rape/",
    },
    {
      id: "acessorios-kuripe-tepi",
      desktopImage: homeAssets.hero.accessoriesDesktopImage,
      mobileImage: homeAssets.hero.accessoriesMobileImage,
      fallbackDesktopImage: homeAssets.hero.desktopImage,
      fallbackMobileImage: homeAssets.hero.mobileImage,
      titlePrimary: "Kuripes\n& Tepis:",
      titleSecondary: "Instrumentos de sopro, feitos com respeito.",
      description:
        "Seja para a autoaplicação ou para conduzir o sopro em rituais, descubra nossos aplicadores confeccionados com intenção e respeito à medicina.",
      ctaLabel: "VER ACESSÓRIOS",
      ctaHref: "/product-category/acessorios/",
    },
  ];

  return (
    <>
      <div className="home-page-flow">
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
            <div className="category-rail">
              {homeCategories.map((category) => (
                <Link className="category-tile" href={category.href} key={category.href}>
                  <span className="category-tile-image">
                    <Image
                      src={category.image}
                      alt=""
                      width={1200}
                      height={1200}
                      sizes="(max-width: 900px) 9.25rem, 11.5rem"
                    />
                  </span>
                  <span className="category-tile-name">{category.name}</span>
                  <span className="category-tile-detail">{category.detail}</span>
                  <span className="category-tile-cta">Ver produtos</span>
                </Link>
              ))}
            </div>
            <span className="scroll-hint category-scroll-hint" aria-hidden="true">Deslize para ver mais</span>
          </div>
        </div>
      </section>

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
            <Link className="button" href="/busca/">
              Ver todos os produtos
            </Link>
          </div>
        </div>
      </section>

      <ProductMatcher products={toRitualCatalog(apiProducts)} />

      <HomeApplicatorsSection />

      <HomeKitsSection banners={rotatingKitBanners} />

      <HomeCraftsSection />

      <section className="incense-section" aria-labelledby="incensos-title">
        <div className="container incense-layout">
          <div className="incense-copy">
            <h2 id="incensos-title">Incensos e aromas da floresta</h2>
            <p>
              Água de cheiro, incensos em vareta e resinas para preparar o ambiente
              e acompanhar seus momentos de presença.
            </p>
          </div>

          <Link className="button incense-cta" href="/product-category/incensos/">
            Ver incensos e resinas
          </Link>
        </div>
      </section>

      <section className="story-section" aria-labelledby="story-title">
        <div className="container story-layout">
          <header className="story-heading">
            <div className="story-title-block">
              <Image
                className="story-logo"
                src="/assets/logo/medicina-sagrada-logo-01.svg"
                alt=""
                width={1200}
                height={300}
              />
              <h2 id="story-title">
                <span>Conhecimento vivo,</span>
                <span>relações de respeito.</span>
              </h2>
            </div>
            <p>
              A nossa forma de caminhar começa pela escuta e pelo cuidado com os
              saberes, as histórias e as comunidades que mantêm essas tradições vivas.
            </p>
          </header>

          <div className="story-pillars">
            <article className="story-pillar story-pillar-knowledge">
              <div
                className="story-pillar-image"
                style={{
                  "--story-pillar-image":
                    'url("/assets/home/story/pillars/medicina-sagrada-conhecimentos-ancestrais.webp")',
                } as CSSProperties}
                role="img"
                aria-label="Duas pessoas em um momento ritual ao lado do fogo"
              />
              <div className="story-pillar-copy">
                <h3>Conhecimentos ancestrais</h3>
                <p>
                  A Medicina Sagrada valoriza e promove conhecimentos ancestrais
                  de medicinas.
                </p>
              </div>
            </article>

            <article className="story-pillar story-pillar-culture">
              <div
                className="story-pillar-image"
                style={{
                  "--story-pillar-image":
                    'url("/assets/home/story/pillars/medicina-sagrada-arte-cultura.webp")',
                } as CSSProperties}
                role="img"
                aria-label="Peça artesanal com grafismos coloridos diante da floresta"
              />
              <div className="story-pillar-copy">
                <h3>Arte e cultura</h3>
                <p>
                  Valorizamos a arte e a cultura das populações indígenas e
                  tradicionais do Brasil.
                </p>
              </div>
            </article>

            <article className="story-pillar story-pillar-community">
              <div
                className="story-pillar-image"
                style={{
                  "--story-pillar-image":
                    'url("/assets/home/story/pillars/medicina-sagrada-historias-protagonismo.webp")',
                } as CSSProperties}
                role="img"
                aria-label="Medicinas em pó, sementes e penas sobre uma superfície trançada"
              />
              <div className="story-pillar-copy">
                <h3>Histórias e protagonismo</h3>
                <p>
                  Cada produto carrega uma história. Compartilhamos esses saberes
                  com cuidado, reconhecendo o protagonismo de seus povos.
                </p>
              </div>
            </article>
          </div>

          <div className="story-cta-row">
            <Link className="button button-solid story-cta" href="/sobre-nos/">
              CONHEÇA A MEDICINA SAGRADA
            </Link>
          </div>
        </div>
      </section>

      <HomeYoutubeSection videos={youtubeVideos} />

      <HomeConexaoAncestralSection />

      <HomeNewsletterSection />
      </div>

      <JsonLd data={pageSchema} />
    </>
  );
}

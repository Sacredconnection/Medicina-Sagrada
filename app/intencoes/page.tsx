import Link from "next/link";
import Image from "next/image";
import { ProductMatcher } from "@/components/product-matcher";
import { intentions, intentionCardImages } from "@/lib/intencoes";
import { toRitualCatalog } from "@/lib/ritual-catalog";
import { getAllProducts } from "@/lib/woocommerce";

export const revalidate = 900;

export const metadata = {
  title: "Intenções | Medicina Sagrada",
  description: "Explore os produtos por intenção e conheça o significado de cada uma.",
};

export default async function IntentionsPage() {
  const products = await getAllProducts().catch(() => []);
  return (
    <div className="intentions-index">
      <div className="intentions-page container">
      <nav className="intentions-breadcrumb" aria-label="Você está aqui">
        <Link href="/">Início</Link><span aria-hidden="true">/</span><span>Intenções</span>
      </nav>
      <header className="intentions-intro">
        <h1>Intenções</h1>
        <div className="intentions-intro-copy">
          <p className="intentions-lede">Explore as {intentions.length} intenções e conheça os produtos relacionados a cada uma.</p>
          <p className="intentions-journey-prompt">Precisa de ajuda para escolher?</p>
          <a className="button intentions-journey-button" href="#descubra-seu-rape">Inicie sua jornada</a>
        </div>
      </header>
      <section className="intentions-list" aria-label="Explore as intenções">
        {intentions.map((intention, index) => (
          <Link className="intention-card" href={`/intencoes/${intention.slug}/`} key={intention.slug}>
            <span className="intention-card-media" aria-hidden="true">
              <Image src={intentionCardImages[intention.slug]} alt="" fill unoptimized={process.env.NODE_ENV === "development"} loading={index === 0 ? "eager" : "lazy"} sizes="(max-width: 600px) 50vw, 16rem" />
            </span>
            <h2 className="intention-card-title">{intention.cardTitle}</h2>
            <span className="intention-card-meaning">{intention.meaning}</span>
            <span className="intention-card-link">Explorar intenção</span>
          </Link>
        ))}
      </section>
      </div>
      <ProductMatcher products={toRitualCatalog(products)} />
    </div>
  );
}

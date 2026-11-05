import Link from "next/link";
import Image from "next/image";
import { intentions, intentionCardImages } from "@/lib/intencoes";

export const revalidate = 900;

export const metadata = {
  title: "Intenções | Medicina Sagrada",
  description: "Explore os produtos por intenção e conheça o significado de cada uma.",
};

export default function IntentionsPage() {
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
          <div className="intentions-journey">
            <p className="intentions-journey-prompt">Quer ajuda para escolher seu rapé? Responda ao questionário sobre sua intenção e experiência e receba uma sugestão para o seu momento.</p>
            <Link className="button intentions-journey-button" href="/questionario/">Responder ao questionário</Link>
          </div>
        </div>
      </header>
      <section className="intentions-list" aria-label="Explore as intenções">
        {intentions.map((intention, index) => (
          <Link className="intention-card" href={`/intencoes/${intention.slug}/`} key={intention.slug}>
            <span className="intention-card-media" aria-hidden="true">
              <Image src={intentionCardImages[intention.slug]} alt="" fill unoptimized={process.env.NODE_ENV === "development"} loading={index === 0 ? "eager" : "lazy"} sizes="(max-width: 1000px) 50vw, (max-width: 1216px) 25vw, 17rem" />
            </span>
            <h2 className="intention-card-title">{intention.cardTitle}</h2>
            <span className="intention-card-meaning">{intention.meaning}</span>
            <span className="intention-card-link">Explorar intenção</span>
          </Link>
        ))}
      </section>
      </div>
    </div>
  );
}

import Link from "next/link";
import { intentions } from "@/lib/intencoes";

export const metadata = {
  title: "Intenções | Medicina Sagrada",
  description: "Explore os produtos por intenção e conheça o significado de cada uma.",
};

export default function IntentionsPage() {
  return (
    <main className="intentions-page container">
      <nav className="intentions-breadcrumb" aria-label="Você está aqui">
        <Link href="/">Início</Link><span aria-hidden="true">/</span><span>Intenções</span>
      </nav>
      <header className="intentions-intro">
        <h1>Intenções</h1>
        <p className="intentions-lede">Explore sete intenções e conheça os produtos relacionados a cada uma.</p>
      </header>
      <section className="intentions-list" aria-label="Explore as intenções">
        {intentions.map((intention) => (
          <Link className="intention-card" href={`/intencoes/${intention.slug}/`} key={intention.slug}>
            <span className="intention-card-title">{intention.name}</span>
            <span className="intention-card-meaning">{intention.meaning}</span>
            <span className="intention-card-link">Conheça esta intenção <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </section>
    </main>
  );
}

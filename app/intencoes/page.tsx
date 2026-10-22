import Link from "next/link";
import { intentions } from "@/lib/intencoes";

export const metadata = {
  title: "Intenções | Medicina Sagrada",
  description: "Conheça os temas editoriais usados para organizar as descrições dos preparos.",
};

export default function IntentionsPage() {
  return (
    <main className="intentions-page container">
      <nav className="intentions-breadcrumb" aria-label="Navegação estrutural">
        <Link href="/">Início</Link><span aria-hidden="true">/</span><span>Intenções</span>
      </nav>
      <header className="intentions-intro">
        <p className="eyebrow">Leitura editorial</p>
        <h1>Intenções</h1>
        <p className="intentions-lede">Sete temas para explorar as palavras e os contextos que acompanham cada preparo.</p>
        <p className="intentions-note">As classificações descrevem a linguagem das fontes consultadas. Não são promessas de resultados nem indicações de segurança.</p>
      </header>
      <section className="intentions-list" aria-label="Temas de intenção">
        {intentions.map((intention) => (
          <Link className="intention-card" href={`/intencoes/${intention.slug}/`} key={intention.slug}>
            <span className="intention-card-title">{intention.name}</span>
            <span className="intention-card-meaning">{intention.meaning}</span>
            <span className="intention-card-link">Conheça o tema <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </section>
    </main>
  );
}

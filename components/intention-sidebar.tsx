import Link from "next/link";
import { intentions } from "@/lib/intencoes";

function IntentionLinks({ currentSlug }: { currentSlug: string }) {
  return <>
    <ul className="intention-sidebar-links">
      {intentions.map(({ slug, name }) => <li key={slug}>
        <Link href={`/intencoes/${slug}/`} aria-current={slug === currentSlug ? "page" : undefined}>
          {name}
        </Link>
      </li>)}
    </ul>
    <Link className="intention-sidebar-all" href="/intencoes/">Todas as intenções →</Link>
  </>;
}

export function IntentionSidebar({ currentSlug }: { currentSlug: string }) {
  return <aside className="intention-sidebar">
    <nav className="intention-sidebar-desktop" aria-label="Escolher intenção">
      <h2>Intenções</h2>
      <IntentionLinks currentSlug={currentSlug} />
    </nav>
    <details className="intention-sidebar-mobile" key={currentSlug}>
      <summary>Escolher intenção <span aria-hidden="true">⌄</span></summary>
      <nav aria-label="Escolher intenção"><IntentionLinks currentSlug={currentSlug} /></nav>
    </details>
  </aside>;
}

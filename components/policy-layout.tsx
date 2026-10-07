import type { ReactNode } from "react";

export type PolicySection = {
  id: string;
  label: string;
};

type PolicyLayoutProps = {
  title: string;
  intro: string;
  note?: string;
  sections: readonly PolicySection[];
  children: ReactNode;
};

function PolicyNavigation({
  sections,
  mobile = false,
}: {
  sections: readonly PolicySection[];
  mobile?: boolean;
}) {
  return (
    <nav aria-label={mobile ? "Seções deste documento no celular" : "Seções deste documento"}>
      {sections.map((section) => (
        <a href={`#${section.id}`} key={section.id}>
          {section.label}
        </a>
      ))}
    </nav>
  );
}

export function PolicyLayout({ title, intro, note, sections, children }: PolicyLayoutProps) {
  return (
    <>
      <header className="policy-hero">
        <h1>{title}</h1>
        <div className="policy-hero-copy">
          <p>{intro}</p>
          {note ? <p className="policy-hero-note">{note}</p> : null}
        </div>
      </header>

      <div className="policy-layout">
        <aside className="policy-index">
          <h2>Neste documento</h2>
          <PolicyNavigation sections={sections} />
        </aside>

        <details className="policy-index-mobile">
          <summary>Neste documento</summary>
          <PolicyNavigation sections={sections} mobile />
        </details>

        {children}
      </div>
    </>
  );
}

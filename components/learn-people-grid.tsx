"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";

type Entry = { slug: string; name: string; summary: string; body: string; href: string; accent: string; foreground: string; media: ReactNode };

export function LearnPeopleGrid({ entries }: { entries: Entry[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const rows = Array.from({ length: Math.ceil(entries.length / 3) }, (_, index) => entries.slice(index * 3, index * 3 + 3));
  return <div className="learn-people-grid">{rows.map((row) => {
    const openIndex = row.findIndex((entry) => entry.slug === openSlug);
    const open = row[openIndex];
    return <div className="learn-people-row" key={row[0].slug}>
      {row.map((entry, index) => <article className={`learn-person${openSlug === entry.slug ? " is-open" : ""}`} key={entry.slug} style={{ "--person-accent": entry.accent, "--person-foreground": entry.foreground, "--mobile-order": index * 2 + 1 } as CSSProperties}>
        {entry.media}<button id={`povo-${entry.slug}`} type="button" aria-expanded={openSlug === entry.slug} aria-controls={`contexto-${entry.slug}`} onClick={() => setOpenSlug(openSlug === entry.slug ? null : entry.slug)}><span className="learn-person-name">{entry.name}</span><span className="learn-person-teaser">{entry.summary}</span><span className="learn-person-chevron" aria-hidden="true" /></button>
      </article>)}
      {open ? <div className="learn-person-panel" id={`contexto-${open.slug}`} role="region" aria-labelledby={`povo-${open.slug}`} style={{ "--person-accent": open.accent, "--person-foreground": open.foreground, "--mobile-order": openIndex * 2 + 2 } as CSSProperties}><p>{open.body}</p><div className="learn-person-choosing"><div><p className="learn-label">Ao escolher</p><p>Observe os ingredientes e a origem descritos em cada preparação.</p></div><Link href={open.href}>Explorar {open.name}</Link></div></div> : null}
    </div>;
  })}</div>;
}

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type Entry = {
  slug: string;
  name: string;
  summary: string;
  body: string;
  href: string;
  accent: string;
  foreground: string;
  media: ReactNode;
};

export function LearnPeopleGrid({ entries }: { entries: Entry[] }) {
  return (
    <div className="learn-people-grid">
      {entries.map((entry) => (
        <article
          className="learn-person"
          key={entry.slug}
          aria-labelledby={`povo-${entry.slug}`}
          style={{
            "--person-accent": entry.accent,
            "--person-foreground": entry.foreground,
          } as CSSProperties}
        >
          <div className="learn-person-visual">
            {entry.media}
            <h3 className="learn-person-name" id={`povo-${entry.slug}`}>
              {entry.name}
            </h3>
          </div>
          <div className="learn-person-copy">
            <p className="learn-person-teaser">{entry.summary}</p>
            <p className="learn-person-body">{entry.body}</p>
            <div className="learn-person-choosing">
              <p className="learn-label">Ao escolher</p>
              <p>Observe os ingredientes e a origem descritos em cada preparação.</p>
            </div>
            <Link className="learn-person-link" href={entry.href}>
              Explorar {entry.name}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

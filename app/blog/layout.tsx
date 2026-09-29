import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container content-page">
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Blog" }]} />
      <header className="archive-header">
        <p className="eyebrow">Histórias e conhecimentos</p>
        <h1>Blog</h1>
        <p>Cultura, tradições e saberes da floresta.</p>
      </header>
      {children}
    </div>
  );
}

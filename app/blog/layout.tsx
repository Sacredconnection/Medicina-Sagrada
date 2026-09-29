import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container content-page blog-page">
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Blog" }]} />
      <header className="blog-header">
        <h1>Blog</h1>
        <div className="blog-header-introduction">
          <p>Histórias e conhecimentos</p>
          <p>Cultura, tradições e saberes da floresta.</p>
        </div>
      </header>
      {children}
    </div>
  );
}

import { RichText } from "@/components/rich-text";
import { buildCategoryEditorial } from "@/lib/category-editorial";
import { cleanHtml } from "@/lib/html";

export function CategoryEditorial({ html, categoryName }: { html: string; categoryName: string }) {
  const content = buildCategoryEditorial(cleanHtml(html));
  const links = (
    <ol>
      {content.items.map(item => (
        <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>
      ))}
    </ol>
  );
  return (
    <section className={`category-editorial${content.items.length > 1 ? " category-editorial-with-index" : ""}`} aria-label={categoryName}>
      {content.items.length > 1 ? (
        <nav className="category-editorial-index" aria-label={`Índice do conteúdo de ${categoryName}`}>
          <p>Neste conteúdo</p>
          {links}
        </nav>
      ) : null}
      <RichText html={content.html} />
    </section>
  );
}

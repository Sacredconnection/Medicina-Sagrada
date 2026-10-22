import { CategoryEditorialIndex } from "@/components/category-editorial-index";
import { RichText } from "@/components/rich-text";
import { buildCategoryEditorial } from "@/lib/category-editorial";
import { cleanHtml } from "@/lib/html";

export function CategoryEditorial({ html, categoryName }: { html: string; categoryName: string }) {
  const content = buildCategoryEditorial(cleanHtml(html));
  return (
    <section className={`category-editorial${content.items.length > 1 ? " category-editorial-with-index" : ""}`} aria-label={categoryName}>
      {content.items.length > 1 ? (
        <CategoryEditorialIndex items={content.items} categoryName={categoryName} />
      ) : null}
      <RichText html={content.html} />
    </section>
  );
}

import { parseDocument } from "htmlparser2";
import { findAll, getOuterHTML } from "domutils";
import { RichText } from "@/components/rich-text";
import { canonicalizeEthnicityNames } from "@/lib/ethnicity-colors";
import { plainText } from "@/lib/html";

export function ProductIntro({ html }: { html: string }) {
  const text = canonicalizeEthnicityNames(plainText(html)).replace(/\s+/g, " ").trim();
  if (!text) return null;

  if (text.length <= 160) {
    return <RichText html={html} className="product-intro" textFilter={canonicalizeEthnicityNames} />;
  }

  const paragraphs = findAll(
    (node) => node.type === "tag" && node.name === "p",
    parseDocument(html).children,
  ).map((node) => canonicalizeEthnicityNames(plainText(getOuterHTML(node))));
  const introduction = paragraphs.find((paragraph) => paragraph.length > 100) ?? text;
  const preview = introduction.length > 160
    ? `${introduction.slice(0, 160).replace(/\s+\S*$/, "")}…`
    : introduction;

  return (
    <div className="product-intro">
      <p className="product-intro-preview">{preview}</p>
      <details className="product-intro-details">
        <summary>
          <span className="product-intro-more">Ler descrição completa</span>
          <span className="product-intro-less">Recolher descrição</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </summary>
        <RichText html={html} textFilter={canonicalizeEthnicityNames} />
      </details>
    </div>
  );
}

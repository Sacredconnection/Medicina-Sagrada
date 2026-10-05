import { parseDocument } from "htmlparser2";
import { findAll, getOuterHTML, textContent } from "domutils";

/** Adapt already sanitized legacy HTML without rewriting its content. */
export function buildCategoryEditorial(html: string) {
  const document = parseDocument(html);
  const items: { id: string; label: string }[] = [];
  const usedIds = new Set(findAll(e => Boolean(e.attribs.id), document.children).map(e => e.attribs.id));
  type ContentNode = (typeof document.children)[number];
  const blocks: ContentNode[] = [];
  const flatten = (nodes: ContentNode[]) => {
    for (const node of nodes) {
      if ("attribs" in node && /^(div|section|article)$/.test(node.name)) {
        if (node.attribs.id) {
          const anchor = parseDocument('<span class="category-editorial-anchor"></span>').children[0];
          if ("attribs" in anchor) anchor.attribs.id = node.attribs.id;
          blocks.push(anchor);
        }
        flatten(node.children);
      } else if (node.type !== "comment") {
        blocks.push(node);
      }
    }
  };
  flatten(document.children);

  const sections: string[][] = [[]];
  let firstHeading = true;
  let inlineContent = "";
  const flushInline = () => {
    if (inlineContent.trim()) sections.at(-1)!.push(`<p>${inlineContent}</p>`);
    inlineContent = "";
  };
  for (const node of blocks) {
    if (!("attribs" in node) || /^(a|span|strong|b|em|i|br)$/.test(node.name)) {
      // Keep fragment targets in the flow, without manufacturing empty paragraphs.
      if ("attribs" in node && node.attribs.class === "category-editorial-anchor") {
        flushInline();
        sections.at(-1)!.push(getOuterHTML(node));
      } else {
        inlineContent += getOuterHTML(node, { encodeEntities: false });
      }
      continue;
    }
    flushInline();
    if (/^(p|h[1-6])$/.test(node.name) && !textContent(node).trim() &&
      !findAll(e => /^(img|iframe|picture)$/.test(e.name), node.children).length) continue;

    if (node.name === "h1") node.name = "h2";
    if (node.name === "h2") {
      const label = textContent(node).replace(/\s+/g, " ").trim();
      if (!node.attribs.id) {
        const slug = label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "assunto";
        const base = `categoria-${slug}`;
        let id = base;
        for (let suffix = 2; usedIds.has(id); suffix++) id = `${base}-${suffix}`;
        usedIds.add(id);
        node.attribs.id = id;
      }
      items.push({ id: node.attribs.id, label });
      const current = sections.at(-1)!;
      // The new section rule replaces the legacy divider immediately before a heading.
      while (current.at(-1) === "<hr>") current.pop();
      if (current.some(block => !block.includes('class="category-editorial-anchor"'))) sections.push([]);
      if (firstHeading) {
        node.attribs.class = `${node.attribs.class ?? ""} category-editorial-title`.trim();
        firstHeading = false;
      }
    }
    const imageOnly = node.name === "p" && !textContent(node).trim() &&
      findAll(e => /^(img|picture)$/.test(e.name), node.children).length > 0;
    if (imageOnly) node.name = "figure";
    if (node.name === "figure") {
      node.attribs.class = `${node.attribs.class ?? ""} category-editorial-media`.trim();
    }
    let block = getOuterHTML(node, { encodeEntities: false });
    if (/^(img|picture)$/.test(node.name)) block = `<figure class="category-editorial-media">${block}</figure>`;
    sections.at(-1)!.push(block);
  }
  flushInline();
  const content = sections.filter(section => section.length).map(section =>
    `<section class="category-editorial-section">${section.join("\n")}</section>`,
  ).join("\n");
  return { html: content, items };
}

export function prepareCategoryEditorialHtml(html: string) {
  return buildCategoryEditorial(html).html;
}

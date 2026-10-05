import { parseDocument } from "htmlparser2";
import { findAll, removeElement, textContent } from "domutils";

// Plain text rendered by React needs no HTML serializer or CSS sanitizer.
// Match the non-text elements omitted by the existing server HTML sanitizer.
const nonTextTags = new Set(["script", "style", "textarea", "option"]);

export function plainText(html: string) {
  const document = parseDocument(html);
  findAll((element) => nonTextTags.has(element.name), document.children).forEach(removeElement);
  return textContent(document).replace(/\s+/g, " ").trim();
}

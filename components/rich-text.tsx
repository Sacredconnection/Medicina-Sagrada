import { cleanHtml } from "@/lib/html";

export function RichText({
  html,
  className = "",
  textFilter,
}: {
  html: string;
  className?: string;
  textFilter?: (text: string, tagName: string) => string;
}) {
  if (!html) return null;
  return (
    <div
      className={`rich-text ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: cleanHtml(html, textFilter) }}
    />
  );
}

import { cleanHtml } from "@/lib/html";

export function RichText({
  html,
  className = "",
  textFilter,
  removeHeadings = false,
}: {
  html: string;
  className?: string;
  textFilter?: (text: string, tagName: string) => string;
  removeHeadings?: boolean;
}) {
  if (!html) return null;
  return (
    <div
      className={`rich-text ${className}`.trim()}
      dangerouslySetInnerHTML={{
        __html: cleanHtml(html, textFilter, { removeHeadings }),
      }}
    />
  );
}

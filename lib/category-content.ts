import { parseDocument } from "htmlparser2";
import { findAll, getInnerHTML } from "domutils";
import { config } from "./config";

// The legacy theme renders this block outside the category REST description.
export function extractCategoryContent(html: string) {
  return findAll(
    (element) => (element.attribs.class ?? "").split(/\s+/).includes("below-woocommerce-category"),
    parseDocument(html).children,
  ).map((element) => getInnerHTML(element)).join("\n");
}

export async function getCategoryContent(pathname: string, categoryId: number) {
  const source = new URL(config.wordpressSiteUrl);
  const url = new URL(pathname, source);
  if (url.origin !== source.origin || !url.pathname.startsWith("/product-category/")) {
    throw new Error("Invalid category content URL");
  }
  const response = await fetch(url, {
    headers: { Accept: "text/html" },
    signal: AbortSignal.timeout(15_000),
    next: { revalidate: config.contentRevalidate, tags: ["wordpress", "woocommerce", "product-category:" + categoryId] },
  });
  if (!response.ok) throw new Error("Category content returned " + response.status);
  return extractCategoryContent(await response.text());
}

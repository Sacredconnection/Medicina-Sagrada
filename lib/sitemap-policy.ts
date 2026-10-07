import type { MetadataRoute } from "next";

// These policies never remove or redirect pages.
const demoPaths = new Set([
  "/sample-page/", "/dev-page/", "/about/", "/women-sale/", "/men-sale/",
  "/customer-help/", "/contact-us/", "/home/", "/homepage/", "/blog-2/",
]);

export function isDemoContentPath(pathname: string): boolean {
  const path = pathname.split(/[?#]/, 1)[0];
  return demoPaths.has(path.endsWith("/") ? path : `${path}/`);
}

const excludedPaths = new Set([
  "/busca/", "/cart/", "/checkout/", "/account/", "/minha-conta/",
  "/diagnostico-api/", "/affiliate-dashboard/",
  ...demoPaths,
]);

export function finalizeSitemap(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const unique = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const entry of entries) {
    const url = new URL(entry.url);
    const pathname = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
    if (url.search || url.hash || pathname.startsWith("/api/") || excludedPaths.has(pathname)) continue;
    url.pathname = pathname;
    // Posts follow CMS pages in the source list, matching the /rape/ resolver.
    unique.set(url.toString(), { ...entry, url: url.toString() });
  }

  return [...unique.values()];
}

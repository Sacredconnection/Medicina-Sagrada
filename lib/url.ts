import { config } from "@/lib/config";

export const ensureLeadingSlash = (pathname: string) =>
  pathname.startsWith("/") ? pathname : `/${pathname}`;

export const ensureTrailingSlash = (pathname: string) => {
  const normalized = ensureLeadingSlash(pathname).replace(/\/+/g, "/");
  return normalized === "/" || normalized.endsWith("/")
    ? normalized
    : `${normalized}/`;
};

export const absoluteUrl = (pathname = "/") =>
  new URL(ensureTrailingSlash(pathname), `${config.siteUrl}/`).toString();

export const pathnameFromUrl = (url: string) => {
  try {
    return ensureTrailingSlash(new URL(url).pathname);
  } catch {
    return ensureTrailingSlash(url);
  }
};

export const pathMatches = (remoteUrl: string, requestedPath: string) =>
  pathnameFromUrl(remoteUrl) === ensureTrailingSlash(requestedPath);

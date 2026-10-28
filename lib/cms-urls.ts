const legacyHosts = new Set(["medicinasagrada.com.br", "www.medicinasagrada.com.br"]);

export function cmsMediaUrl(value: string, wordpress: string) {
  try {
    const target = new URL(wordpress);
    const url = new URL(value, target);
    if (!/^https?:$/.test(url.protocol) || !url.pathname.startsWith("/wp-content/uploads/") ||
      (!legacyHosts.has(url.hostname) && url.origin !== target.origin)) return value;
    return `${target.origin}${url.pathname}${url.search}${url.hash}`;
  } catch { return value; }
}

export function cmsLinkUrl(value: string, wordpress: string) {
  const media = cmsMediaUrl(value, wordpress);
  if (media !== value) return media;
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || (url.origin !== new URL(wordpress).origin && !legacyHosts.has(url.hostname))) return value;
    // Account, payment and administration stay on WordPress. Editorial links
    // should stay on whichever frontend (preview or production) is being viewed.
    if (/^\/(?:wp-|checkout(?:\/|$)|account(?:\/|$)|my-account(?:\/|$))/.test(url.pathname)) return value;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return value; }
}

export function mapCmsUrls<T>(data: T, wordpress: string): T {
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(visit);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, visit(item)]));
    if (typeof value !== "string") return value;
    return value
      .replace(/\bhref=(["'])(.*?)\1/gi, (_match, quote: string, href: string) => `href=${quote}${cmsLinkUrl(href, wordpress)}${quote}`)
      .replace(/(?:https?:)?\/\/[^\s"'<>]+\/wp-content\/uploads\/[^\s"'<>]*/gi, url => cmsMediaUrl(url, wordpress));
  };
  return visit(data) as T;
}

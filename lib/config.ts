const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

// Older deployments configured Woo's English default, but this installation
// serves the account at /account/ (/my-account/ is a confirmed 404).
const accountUrl = () => {
  const wordpress = process.env.WORDPRESS_SITE_URL ?? "https://medicinasagrada.com.br";
  const url = new URL(process.env.WOOCOMMERCE_ACCOUNT_URL ?? `${stripTrailingSlash(wordpress)}/account/`);
  if (url.origin === new URL(wordpress).origin && /^\/my-account\/?$/.test(url.pathname)) url.pathname = "/account/";
  return url.toString();
};

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const config = {
  siteName: "Medicina Sagrada",
  siteUrl: stripTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"),
  ),
  wordpressSiteUrl: stripTrailingSlash(
    process.env.WORDPRESS_SITE_URL ?? "https://medicinasagrada.com.br",
  ),
  wordpressApiUrl: stripTrailingSlash(
    process.env.WORDPRESS_API_URL ??
      "https://medicinasagrada.com.br/wp-json",
  ),
  wooStoreApiUrl: stripTrailingSlash(
    process.env.WOOCOMMERCE_STORE_API_URL ??
      `${
        process.env.WORDPRESS_API_URL ??
        "https://medicinasagrada.com.br/wp-json"
      }/wc/store/v1`,
  ),
  contentRevalidate: parsePositiveInteger(
    process.env.CONTENT_REVALIDATE_SECONDS,
    900,
  ),
  wooCheckoutUrl: process.env.WOOCOMMERCE_CHECKOUT_URL ?? `${stripTrailingSlash(process.env.WORDPRESS_SITE_URL ?? "https://medicinasagrada.com.br")}/checkout/`,
  wooAccountUrl: accountUrl(),
} as const;

export const isProductionSite =
  process.env.NODE_ENV === "production" &&
  config.siteUrl === "https://medicinasagrada.com.br";

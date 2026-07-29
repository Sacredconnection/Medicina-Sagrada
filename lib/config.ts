const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const config = {
  siteName: "Medicina Sagrada",
  siteUrl: stripTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
} as const;

export const isProductionSite =
  process.env.NODE_ENV === "production" &&
  config.siteUrl === "https://medicinasagrada.com.br";

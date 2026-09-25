import type { Metadata } from "next";
import { config } from "@/lib/config";
import { excerpt, plainText } from "@/lib/html";
import type {
  WooCategory,
  WooProduct,
  WordPressContent,
} from "@/lib/types";
import { absoluteUrl } from "@/lib/url";

type MetadataInput = {
  title: string;
  description: string;
  pathname: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
};

export function createMetadata({
  title,
  description,
  pathname,
  image,
  type = "website",
  noIndex = false,
}: MetadataInput): Metadata {
  const canonical = absoluteUrl(pathname);
  const images = image ? [{ url: image }] : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type,
      locale: "pt_BR",
      siteName: config.siteName,
      title,
      description,
      url: canonical,
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export const metadataForContent = (
  content: WordPressContent,
  pathname: string,
) =>
  createMetadata({
    title: plainText(content.title.rendered),
    description: excerpt(
      content.excerpt.rendered || content.content.rendered,
    ),
    pathname,
    image: content._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
    type: content.type === "post" ? "article" : "website",
  });

export const metadataForProduct = (product: WooProduct, pathname: string) =>
  createMetadata({
    title: plainText(product.name),
    description: excerpt(
      product.short_description || product.description,
    ),
    pathname,
    image: product.images[0]?.src,
  });

export const metadataForProductCategory = (
  category: WooCategory,
  pathname: string,
) =>
  createMetadata({
    title: plainText(category.name),
    description:
      excerpt(category.description) ||
      `Conheça os produtos da categoria ${plainText(category.name)} na Medicina Sagrada.`,
    pathname,
    image: category.image?.src,
  });

const productPrice = (product: WooProduct) => {
  const divisor = 10 ** product.prices.currency_minor_unit;
  return (Number(product.prices.price) / divisor).toFixed(
    product.prices.currency_minor_unit,
  );
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${config.siteUrl}/#organization`,
  name: config.siteName,
  url: config.siteUrl,
  email: "contato@medicinasagrada.com.br",
  sameAs: [
    "https://www.instagram.com/medicinasagradabr/",
    "https://www.youtube.com/@medicinasagradabr",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${config.siteUrl}/#website`,
  name: config.siteName,
  url: config.siteUrl,
  inLanguage: "pt-BR",
  publisher: { "@id": `${config.siteUrl}/#organization` },
};

export const productSchema = (product: WooProduct) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": `${absoluteUrl(`/product/${product.slug}`)}#product`,
  name: plainText(product.name),
  description: excerpt(product.description || product.short_description, 500),
  sku: product.sku || undefined,
  image: product.images.map((image) => image.src),
  category: product.categories.map((category) => category.name).join(", "),
  offers: {
    "@type": "Offer",
    url: absoluteUrl(`/product/${product.slug}`),
    priceCurrency: product.prices.currency_code,
    price: productPrice(product),
    availability: product.is_in_stock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
  },
  ...(product.review_count > 0
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.average_rating,
          reviewCount: product.review_count,
        },
      }
    : {}),
});

export const breadcrumbSchema = (
  items: Array<{ name: string; pathname: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.pathname),
  })),
});

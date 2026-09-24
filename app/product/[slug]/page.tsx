import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { ProductPurchase } from "@/components/product-purchase";
import { config } from "@/lib/config";
import { plainText } from "@/lib/html";
import {
  breadcrumbSchema,
  metadataForProduct,
  productSchema,
} from "@/lib/seo";
import { pathMatches } from "@/lib/url";
import { getProductBySlug, getProductVariations } from "@/lib/woocommerce";

export const revalidate = 900;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const pathname = `/product/${slug}/`;

  if (!product || !pathMatches(product.permalink, pathname)) {
    return { title: "Produto não encontrado", robots: { index: false } };
  }

  return metadataForProduct(product, pathname);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const pathname = `/product/${slug}/`;

  if (!product || !pathMatches(product.permalink, pathname)) notFound();

  const primaryCategory = product.categories[0];
  const breadcrumbs = [
    { name: "Início", pathname: "/" },
    ...(primaryCategory
      ? [
          {
            name: primaryCategory.name,
            pathname: `/product-category/${primaryCategory.slug}/`,
          },
        ]
      : []),
    { name: plainText(product.name), pathname },
  ];
  const image = product.images[0];
  const variants = await getProductVariations(product);

  return (
    <article className="container content-page product-page">
      <Breadcrumbs
        items={breadcrumbs.map((item, index) => ({
          label: item.name,
          href: index === breadcrumbs.length - 1 ? undefined : item.pathname,
        }))}
      />
      <div className="product-layout">
        <div className="product-gallery">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt || plainText(product.name)}
              width={900}
              height={900}
              sizes="(max-width: 800px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="product-image product-image-large">
              Imagem indisponível
            </div>
          )}
        </div>
        <div className="product-summary">
          {primaryCategory ? (
            <Link
              className="eyebrow"
              href={`/product-category/${primaryCategory.slug}/`}
            >
              {primaryCategory.name}
            </Link>
          ) : null}
          <h1>{plainText(product.name)}</h1>
          <RichText html={product.price_html} className="product-price" />
          <RichText html={product.short_description} />
          <p className="availability">
            {product.is_in_stock ? "Em estoque" : "Consulte a disponibilidade"}
          </p>
          <ProductPurchase product={product} variants={variants} originalUrl={new URL(pathname, config.wordpressSiteUrl).toString()} />
        </div>
      </div>
      <section className="product-description" aria-labelledby="descricao">
        <h2 id="descricao">Sobre este produto</h2>
        <RichText html={product.description} />
      </section>
      <JsonLd data={[productSchema(product), breadcrumbSchema(breadcrumbs)]} />
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductGallery } from "@/components/product-gallery";
import { ProductReviews } from "@/components/product-reviews";
import { ProductCard } from "@/components/product-card";
import { getReviews } from "@/lib/reviews";
import { config } from "@/lib/config";
import { plainText } from "@/lib/html";
import {
  breadcrumbSchema,
  metadataForProduct,
  productSchema,
} from "@/lib/seo";
import { pathMatches } from "@/lib/url";
import { getProductBySlug, getProductVariations, getProductCategoryBySlug, getProducts } from "@/lib/woocommerce";

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
  const [category, variants, reviews, related] = await Promise.all([
    primaryCategory ? getProductCategoryBySlug(primaryCategory.slug).catch(() => null) : null,
    getProductVariations(product),
    getReviews(product.id).catch(() => null),
    primaryCategory ? getProducts({ categoryId: primaryCategory.id, perPage: 5 }).catch(() => []) : [],
  ]);
  const categoryPath = category ? new URL(category.permalink).pathname : "/busca/";
  const breadcrumbs = [
    { name: "Início", pathname: "/" },
    ...(primaryCategory
      ? [
          {
            name: primaryCategory.name,
            pathname: categoryPath,
          },
        ]
      : []),
    { name: plainText(product.name), pathname },
  ];

  return (
    <article className="container content-page product-page">
      <Breadcrumbs
        items={breadcrumbs.map((item, index) => ({
          label: item.name,
          href: index === breadcrumbs.length - 1 ? undefined : item.pathname,
        }))}
      />
      <div className="product-layout">
        <ProductGallery images={product.images} name={plainText(product.name)} />
        <div className="product-summary">
          {primaryCategory ? (
            <Link
              className="eyebrow"
              href={categoryPath}
            >
              {primaryCategory.name}
            </Link>
          ) : null}
          <h1>{plainText(product.name)}</h1>
          <a className="product-review-link" href="#avaliacoes">{product.review_count ? `★ ${Number(product.average_rating).toLocaleString("pt-BR")} · ${product.review_count} avaliações` : "Seja o primeiro a avaliar"}</a>
          <ProductPurchase product={product} variants={variants} originalUrl={new URL(pathname, config.wordpressSiteUrl).toString()}>
          <RichText html={product.short_description} />
          <p className="availability">
            {product.is_in_stock ? "Em estoque" : "Consulte a disponibilidade"}
          </p>
          </ProductPurchase>
          <p className="purchase-detail">Entrega calculada pelo CEP. <Link href="/refund_returns/">Trocas e devoluções</Link>.</p>
        </div>
      </div>
      <section className="product-description" aria-labelledby="descricao">
        <h2 id="descricao">Sobre este produto</h2>
        <RichText html={product.description} />
      </section>
      <ProductReviews productId={product.id} count={product.review_count} average={product.average_rating} initial={reviews ?? { data: [], totalPages: 0 }} initialError={!reviews} reviewUrl={`${new URL(pathname, config.wordpressSiteUrl)}#review_form`} />
      {related.some(item => item.id !== product.id) ? <section className="related-products"><h2>Na mesma categoria</h2><div className="product-grid">{related.filter(item => item.id !== product.id).slice(0, 4).map(item => <ProductCard key={item.id} product={item} headingLevel={3} />)}</div></section> : null}
      <JsonLd data={[productSchema(product), breadcrumbSchema(breadcrumbs)]} />
    </article>
  );
}

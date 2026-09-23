import Image from "next/image";
import Link from "next/link";
import { plainText } from "@/lib/html";
import type { WooProduct } from "@/lib/types";

const formatPrice = (product: WooProduct) => {
  const { prices } = product;
  const divisor = 10 ** prices.currency_minor_unit;
  const format = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: prices.currency_code,
  });

  if (prices.price_range) {
    return `${format.format(
      Number(prices.price_range.min_amount) / divisor,
    )} – ${format.format(Number(prices.price_range.max_amount) / divisor)}`;
  }

  return format.format(Number(prices.price) / divisor);
};

type ProductCardProps = {
  product: WooProduct;
  headingLevel?: 2 | 3;
};

export function ProductCard({ product, headingLevel = 2 }: ProductCardProps) {
  const image = product.images[0];
  const productName = plainText(product.name);
  const productHref = `/product/${product.slug}/`;
  const rating = Number(product.average_rating);
  const hasReviews = product.review_count > 0 && Number.isFinite(rating) && rating > 0;
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <article className="product-card">
      <Link className="product-card-link" href={productHref}>
        <div className="product-image" aria-hidden="true">
          {image ? (
            <Image
              src={image.src}
              alt=""
              fill
              sizes="(max-width: 360px) 100vw, (max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"
            />
          ) : (
            <span>Imagem indisponível</span>
          )}
        </div>
        <div className="product-card-body">
          <div className="product-card-meta">
            <span className="product-category">
              {product.categories[0]?.name ?? "Medicina Sagrada"}
            </span>
            {hasReviews ? (
              <span
                className="product-rating"
                aria-label={`${rating.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} de 5 estrelas em ${product.review_count} ${product.review_count === 1 ? "avaliação" : "avaliações"}`}
              >
                <span aria-hidden="true">★</span>{" "}
                {rating.toLocaleString("pt-BR", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
                <span className="product-review-count">({product.review_count})</span>
              </span>
            ) : null}
          </div>
          <Heading>{productName}</Heading>
          <p className="price">{formatPrice(product)}</p>
          <span className="product-cta">
            <span>Ver produto</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

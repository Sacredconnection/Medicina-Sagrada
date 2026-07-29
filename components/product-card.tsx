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

export function ProductCard({ product }: { product: WooProduct }) {
  const image = product.images[0];

  return (
    <article className="product-card">
      <Link href={`/product/${product.slug}/`} tabIndex={-1} aria-hidden="true">
        <div className="product-image">
          {image ? (
            <Image
              src={image.thumbnail || image.src}
              alt={image.alt || plainText(product.name)}
              fill
              sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"
            />
          ) : (
            <span>Imagem indisponível</span>
          )}
        </div>
      </Link>
      <div className="product-card-body">
        <p className="eyebrow">
          {product.categories[0]?.name ?? "Medicina Sagrada"}
        </p>
        <h2>
          <Link href={`/product/${product.slug}/`}>
            {plainText(product.name)}
          </Link>
        </h2>
        <p className="price">{formatPrice(product)}</p>
      </div>
    </article>
  );
}

import { ProductCard } from "@/components/product-card";
import type { WooProduct } from "@/lib/types";

const HOME_PRODUCT_LIMIT = 8;

export function HomeProductGrid({ products }: { products: WooProduct[] }) {
  const visibleProducts = products.slice(0, HOME_PRODUCT_LIMIT);

  return (
    <div className="product-grid home-product-grid">
      {visibleProducts.map((product) => (
        <ProductCard key={product.id} product={product} headingLevel={3} />
      ))}
    </div>
  );
}

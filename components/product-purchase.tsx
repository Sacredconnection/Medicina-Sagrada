import { ProductPurchaseControls, type ProductPurchaseProps } from "@/components/product-purchase-controls";
import { cleanHtml } from "@/lib/html";

export function ProductPurchase({ product, variants, originalUrl }: ProductPurchaseProps) {
  return <ProductPurchaseControls
    product={{ ...product, price_html: cleanHtml(product.price_html) }}
    variants={variants.map(variant => ({ ...variant, price_html: cleanHtml(variant.price_html) }))}
    originalUrl={originalUrl}
  />;
}

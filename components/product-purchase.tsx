import { ProductPurchaseControls, type ProductPurchaseProps } from "@/components/product-purchase-controls";
import { getPurchasePrice } from "@/lib/purchase-price";

export function ProductPurchase({ product, variants, originalUrl }: ProductPurchaseProps) {
  return <ProductPurchaseControls
    product={{ ...product, price_html: "" }}
    variants={variants.map(variant => ({ ...variant, price_html: "" }))}
    prices={Object.fromEntries([product, ...variants].map(item => [item.id, getPurchasePrice(item)]))}
    originalUrl={originalUrl}
  />;
}

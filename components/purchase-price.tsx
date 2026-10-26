import { formatMoney } from "@/lib/cart-types";
import type { PurchasePrice as Price } from "@/lib/purchase-price";
import type { WooPrices } from "@/lib/types";

export function PurchasePrice({ price, currency, compact = false }: { price: Price | null; currency: WooPrices; compact?: boolean }) {
  if (!price) return <span>Consulte o preço</span>;
  const money = (amount: string) => formatMoney(amount, currency.currency_code, currency.currency_minor_unit);
  const range = (amount: string, maximum?: string) => maximum ? `${money(amount)} – ${money(maximum)}` : money(amount);
  return <span className={compact ? "swatch-price" : "product-price"}>
    {price.regular ? <del><span className="screen-reader-text">De </span>{range(price.regular, price.regularMaximum)}</del> : null}
    <span className="purchase-current-price">{price.regular ? <span className="screen-reader-text">Por </span> : null}{range(price.amount, price.maximum)}</span>
  </span>;
}

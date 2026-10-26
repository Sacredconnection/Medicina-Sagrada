"use client";

import Link from "next/link";
import { useState } from "react";
import { ShippingCalculator } from "@/components/shipping-calculator";
import { useCart } from "@/components/cart-provider";
import { useProductVariation } from "@/components/product-variation-provider";
import { PurchasePrice } from "@/components/purchase-price";
import { formatMoney } from "@/lib/cart-types";
import type { PurchasePrice as Price } from "@/lib/purchase-price";
import type { WooProduct } from "@/lib/types";

export type ProductPurchaseProps = { product: WooProduct; variants: WooProduct[]; originalUrl: string };

export function ProductPurchaseControls({ product, variants, originalUrl, prices }: ProductPurchaseProps & { prices: Record<number, Price | null> }) {
  const { mutate, busy, loading, error } = useCart();
  const { setVariation } = useProductVariation();
  const [selection, setSelection] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const variable = product.type === "variable";
  const selected = variable ? variants.find((variant) => String(variant.id) === selection) : product;
  const selectedPrice = selected ? prices[selected.id] : null;
  const weightOptions = variable && variants.every(variant => /^peso\s*:/i.test(variant.variation ?? "") || product.variations?.find(entry => entry.id === variant.id)?.attributes.every(attribute => attribute.name.toLowerCase() === "peso"));
  const purchasable = selected?.is_purchasable !== false && selected?.is_in_stock !== false;
  const minimum = selected?.add_to_cart?.minimum ?? 1;
  const maximum = Math.min(selected?.add_to_cart?.maximum ?? 9999, 9999);
  const step = selected?.add_to_cart?.multiple_of ?? 1;
  const validQuantity = Number.isFinite(quantity) && quantity >= minimum && quantity <= maximum && (quantity - minimum) % step === 0;
  const total = selected && selectedPrice && validQuantity ? formatMoney(String(Number(selectedPrice.amount) * quantity), selected.prices.currency_code, selected.prices.currency_minor_unit) : "—";

  if (!["simple", "variable", "variation"].includes(product.type) || (variable && !variants.length)) {
    return <div className="purchase-panel"><p>Confira as opções disponíveis para este produto.</p><a className="commerce-button" href={originalUrl}>Escolher na loja</a></div>;
  }

  return <><div className="purchase-price" aria-live="polite"><PurchasePrice price={prices[(selected ?? product).id]} currency={(selected ?? product).prices} /><span className={`purchase-stock${(selected ?? product).is_in_stock === false ? " is-unavailable" : ""}`}>{(selected ?? product).is_in_stock === false ? "Indisponível" : "Em estoque"}</span>{variable && !selected ? <p className="purchase-detail">Selecione uma opção para ver o preço exato.</p> : null}</div><form className="purchase-panel" onSubmit={async (event) => {
    event.preventDefault();
    if (!selected || !selectedPrice || !purchasable || !validQuantity) return;
    setAdded(false);
    if (await mutate({ action: "add", id: selected.id, quantity })) setAdded(true);
  }}>
    <div className="purchase-fields">
    {variable ? <fieldset className="purchase-option" disabled={busy}>
      <legend>{weightOptions ? "Escolha o peso" : "Escolha uma opção"}</legend>
      <div className="purchase-swatches">
        {variants.map((variant) => <label key={variant.id} className="purchase-swatch">
          <input type="radio" name="product-variation" required value={variant.id} checked={selection === String(variant.id)} disabled={variant.is_in_stock === false || variant.is_purchasable === false} onChange={() => {
            setSelection(String(variant.id));
            setVariation({ id: variant.id, image: variant.images?.[0] });
            setQuantity(variant.add_to_cart?.minimum ?? 1);
            setAdded(false);
          }} />
          <span className="purchase-swatch-content">
            <span className="purchase-swatch-heading"><strong>{(product.variations?.find((entry) => entry.id === variant.id)?.attributes.map((attr) => attr.value).join(" / ") || variant.variation || variant.name).replace(/^Peso:\s*/i, "").replace(/^(\d+(?:[.,]\d+)?)\s*(g|kg|mg)$/i, "$1 $2")}</strong><span className="purchase-swatch-check" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 8 3 3 5-6" /></svg></span></span>
            {variant.is_in_stock === false ? <span className="purchase-swatch-unavailable">Esgotado</span> : variant.is_purchasable === false ? <span className="purchase-swatch-unavailable">Indisponível</span> : <PurchasePrice price={prices[variant.id]} currency={variant.prices} compact />}
          </span>
        </label>)}
      </div>
    </fieldset> : null}
      <div className="purchase-quantity-row"><label className="commerce-field purchase-quantity">Quantidade
        <input type="number" inputMode="numeric" min={minimum} max={maximum} step={step} required value={quantity} disabled={busy || !purchasable} onChange={(event) => { setQuantity(Number(event.target.value)); setAdded(false); }} />
      </label><div className="purchase-total" aria-live="polite"><span>Total do produto</span><strong>{total}</strong></div></div>
    </div>
    <button className="commerce-button" disabled={busy || loading || !selected || !selectedPrice || !purchasable || !validQuantity} type="submit">{busy ? "Atualizando…" : selected && !purchasable ? "Produto indisponível" : "Adicionar à sacola"}</button>
    <p className="purchase-detail">Frete e condições de pagamento na finalização.</p>
    {error ? <p className="commerce-error" role="alert">{error}</p> : null}
    {added ? <p className="commerce-success" role="status">Produto adicionado. <Link href="/cart/">Ver minha sacola →</Link></p> : null}
  </form><details className="product-delivery"><summary><span>Calcule o frete e o prazo<small>Informe seu CEP de entrega</small></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></summary><ShippingCalculator productId={selected?.id} quantity={quantity} available={purchasable && validQuantity} /></details></>;
}

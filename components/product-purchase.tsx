"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/cart-types";
import type { WooProduct } from "@/lib/types";

export function ProductPurchase({ product, variants, originalUrl }: { product: WooProduct; variants: WooProduct[]; originalUrl: string }) {
  const { mutate, busy, loading, error } = useCart();
  const [selection, setSelection] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const variable = product.type === "variable";
  const selected = variable ? variants.find((variant) => String(variant.id) === selection) : product;
  const purchasable = selected?.is_purchasable !== false && selected?.is_in_stock !== false;
  const minimum = selected?.add_to_cart?.minimum ?? 1;
  const maximum = Math.min(selected?.add_to_cart?.maximum ?? 9999, 9999);
  const step = selected?.add_to_cart?.multiple_of ?? 1;

  if (!["simple", "variable", "variation"].includes(product.type) || (variable && !variants.length)) {
    return <div className="purchase-panel"><p>Confira as opções disponíveis para este produto.</p><a className="commerce-button" href={originalUrl}>Escolher na loja</a></div>;
  }

  return <form className="purchase-panel" onSubmit={async (event) => {
    event.preventDefault();
    if (!selected || !purchasable) return;
    setAdded(false);
    if (await mutate({ action: "add", id: selected.id, quantity })) setAdded(true);
  }}>
    {variable ? <label className="commerce-field">Escolha uma opção
      <select required value={selection} disabled={busy} onChange={(event) => { setSelection(event.target.value); setQuantity(variants.find((v) => String(v.id) === event.target.value)?.add_to_cart?.minimum ?? 1); setAdded(false); }}>
        <option value="">Selecione o peso ou modelo</option>
        {variants.map((variant) => <option key={variant.id} value={variant.id} disabled={variant.is_in_stock === false || variant.is_purchasable === false}>
          {variant.variation || product.variations?.find((entry) => entry.id === variant.id)?.attributes.map((attr) => attr.value).join(" / ") || variant.name}
          {variant.is_in_stock === false ? " — Esgotado" : ` — ${formatMoney(variant.prices.price, variant.prices.currency_code, variant.prices.currency_minor_unit)}`}
        </option>)}
      </select>
    </label> : null}
    <div className="purchase-actions">
      <label className="commerce-field purchase-quantity">Quantidade
        <input type="number" inputMode="numeric" min={minimum} max={maximum} step={step} required value={quantity} disabled={busy || !purchasable} onChange={(event) => { setQuantity(Number(event.target.value)); setAdded(false); }} />
      </label>
      <button className="commerce-button" disabled={busy || loading || !selected || !purchasable} type="submit">{busy ? "Atualizando…" : selected && !purchasable ? "Produto indisponível" : "Adicionar à sacola"}</button>
    </div>
    <p className="purchase-detail">Frete e condições de pagamento na finalização.</p>
    {error ? <p className="commerce-error" role="alert">{error}</p> : null}
    {added ? <p className="commerce-success" role="status">Produto adicionado. <Link href="/cart/">Ver minha sacola →</Link></p> : null}
  </form>;
}

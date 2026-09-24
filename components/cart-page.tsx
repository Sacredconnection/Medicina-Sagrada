"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/cart-types";
import { plainText } from "@/lib/html";

export function CartPage() {
  const { cart, busy, loading, error, mutate, refresh, checkout } = useCart();
  const [coupon, setCoupon] = useState("");
  const money = (value: string) => formatMoney(value, cart?.totals.currency_code, cart?.totals.currency_minor_unit);

  return <section className="container content-page bag-page">
    <div className="bag-heading"><div><p className="eyebrow">Sua escolha</p><h1>Minha sacola</h1></div><Link href="/">Continuar comprando →</Link></div>
    {error ? <div className="commerce-error" role="alert"><p>{error}</p><button className="commerce-text-button" disabled={busy || loading} onClick={() => void refresh()}>Atualizar sacola</button></div> : null}
    {loading && !cart ? <p role="status">Carregando sua sacola…</p> : null}
    {cart && cart.items.length === 0 ? <div className="bag-empty"><span aria-hidden="true">◌</span><h2>Sua sacola está vazia</h2><p>Explore a loja e escolha os produtos que quer levar com você.</p><Link className="commerce-button" href="/">Explorar a loja</Link></div> : null}
    {cart && cart.items.length > 0 ? <div className="bag-layout" aria-busy={busy || loading}>
      <div className="bag-items">
        <p className="bag-items-heading">{cart.items_count} {cart.items_count === 1 ? "item selecionado" : "itens selecionados"}</p>
        {cart.items.map((item) => {
          const href = new URL(item.permalink).pathname;
          const limits = item.quantity_limits;
          return <article className="bag-item" key={item.key}>
            <Link className="bag-item-image" href={href} tabIndex={-1} aria-hidden="true">{item.images[0] ? <Image src={item.images[0].thumbnail || item.images[0].src} alt="" width={140} height={140} /> : <span>Sem imagem</span>}</Link>
            <div className="bag-item-info"><h2><Link href={href}>{plainText(item.name)}</Link></h2>
              {item.variation.length ? <p>{item.variation.map((option) => `${plainText(option.attribute)}: ${plainText(option.value)}`).join(" · ")}</p> : null}
              <div className="bag-item-controls"><div className="bag-quantity" aria-label={`Quantidade de ${plainText(item.name)}`}>
                <button type="button" disabled={busy || loading || !limits.editable || item.quantity - limits.multiple_of < limits.minimum} aria-label={`Diminuir quantidade de ${plainText(item.name)}`} onClick={() => void mutate({ action: "update", key: item.key, quantity: item.quantity - limits.multiple_of })}>−</button>
                <span aria-live="polite">{item.quantity}</span>
                <button type="button" disabled={busy || loading || !limits.editable || item.quantity + limits.multiple_of > limits.maximum} aria-label={`Aumentar quantidade de ${plainText(item.name)}`} onClick={() => void mutate({ action: "update", key: item.key, quantity: item.quantity + limits.multiple_of })}>+</button>
              </div><button className="commerce-text-button" type="button" disabled={busy || loading} aria-label={`Remover ${plainText(item.name)}`} onClick={() => void mutate({ action: "remove", key: item.key })}>Remover</button></div>
            </div>
            <strong className="bag-item-price">{money(item.totals.line_total)}</strong>
          </article>;
        })}
      </div>
      <aside className="bag-summary" aria-label="Resumo da compra"><h2>Resumo da compra</h2>
        <dl><div><dt>Produtos</dt><dd>{money(cart.totals.total_items)}</dd></div>
          {Number(cart.totals.total_discount) > 0 ? <div><dt>Descontos</dt><dd>− {money(cart.totals.total_discount)}</dd></div> : null}
          <div><dt>Frete</dt><dd>Calculado na próxima etapa</dd></div>
          {Number(cart.totals.total_tax) > 0 ? <div><dt>Impostos</dt><dd>{money(cart.totals.total_tax)}</dd></div> : null}
          <div className="bag-subtotal"><dt>Subtotal</dt><dd>{money(String(Number(cart.totals.total_price) - Number(cart.totals.total_shipping ?? 0)))}</dd></div>
        </dl>
        <form className="bag-coupon" onSubmit={async (event) => { event.preventDefault(); if (await mutate({ action: "apply-coupon", code: coupon })) setCoupon(""); }}><label className="commerce-field" htmlFor="coupon">Tem um cupom?</label><div><input id="coupon" placeholder="Código do cupom" value={coupon} maxLength={100} onChange={(event) => setCoupon(event.target.value)} disabled={busy || loading} required /><button type="submit" disabled={busy || loading || !coupon.trim()}>Aplicar</button></div></form>
        {cart.coupons.map((entry) => <p className="bag-applied-coupon" key={entry.code}>{entry.code}<button type="button" className="commerce-text-button" disabled={busy || loading} onClick={() => void mutate({ action: "remove-coupon", code: entry.code })}>Remover cupom</button></p>)}
        {cart.errors.map((entry) => <p className="commerce-error" role="alert" key={entry.code}>{plainText(entry.message)}</p>)}
        <button className="commerce-button bag-checkout" disabled={busy || loading || cart.errors.length > 0} onClick={() => void checkout()}>{busy ? "Preparando sua compra…" : "Continuar para pagamento →"}</button>
        <p className="bag-payment-note">Você continuará no checkout seguro da Medicina Sagrada para informar a entrega e escolher como pagar.</p>
        <div className="bag-payment-methods" aria-label="Formas de pagamento">{cart.payment_methods.includes("woo-pagarme-payments-pix") ? <span>Pix</span> : null}{cart.payment_methods.includes("woo-pagarme-payments-credit_card") ? <span>Cartão</span> : null}{cart.payment_methods.includes("woo-pagarme-payments-billet") ? <span>Boleto</span> : null}</div>
      </aside>
    </div> : null}
  </section>;
}

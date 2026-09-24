"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/cart-types";
import { plainText } from "@/lib/html";

export function CartDrawer({ open, onClose, trigger }: { open: boolean; onClose: () => void; trigger: RefObject<HTMLElement | null> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { cart, busy, loading, error, mutate, checkout } = useCart();
  useEffect(() => {
    const element = dialog.current;
    if (!open || !element) return;
    const previousFocus = trigger.current;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [open, trigger]);
  const money = (value: string) => formatMoney(value, cart?.totals.currency_code, cart?.totals.currency_minor_unit);
  return <dialog ref={dialog} className="cart-drawer" aria-labelledby="cart-drawer-title" onCancel={onClose} onKeyDown={(event) => {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), [tabindex="0"]')).filter(element => element.getClientRects().length > 0);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onClick={(event) => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }}>
    <header className="cart-drawer-heading"><div><p className="eyebrow">Sua escolha</p><h2 id="cart-drawer-title">Minha sacola <small>({cart?.items_count ?? 0})</small></h2></div><button type="button" className="cart-drawer-close" aria-label="Fechar sacola" onClick={onClose}>×</button></header>
    <div className="cart-drawer-items" aria-busy={busy || loading}>
      {error ? <p className="commerce-error" role="alert">{error}</p> : null}
      {loading && !cart ? <p>Carregando sua sacola…</p> : null}
      {cart?.items.length === 0 ? <p>Sua sacola está vazia. Continue explorando a loja.</p> : null}
      {cart?.items.map(item => <article className="cart-drawer-item" key={item.key}>
        {item.images[0] ? <Image src={item.images[0].thumbnail || item.images[0].src} alt="" width={88} height={88} /> : <span />}
        <div><h3><Link href={new URL(item.permalink).pathname} onClick={onClose}>{plainText(item.name)}</Link></h3>
          {item.variation.length ? <p>{item.variation.map(option => `${plainText(option.attribute)}: ${plainText(option.value)}`).join(" · ")}</p> : null}
          <p>Quantidade: {item.quantity}</p><strong>{money(item.totals.line_total)}</strong><br />
          <button type="button" className="commerce-text-button" disabled={busy || loading} aria-label={`Remover ${plainText(item.name)}`} onClick={() => void mutate({ action: "remove", key: item.key })}>Remover</button>
        </div>
      </article>)}
    </div>
    <footer className="cart-drawer-footer">
      {cart && cart.items.length > 0 ? <>
        <div className="cart-drawer-subtotal"><span>Produtos</span><strong>{money(cart.totals.total_items)}</strong></div>
        <p className="purchase-detail">Frete, descontos e total na sacola ou na finalização.</p>
        {cart.errors.map(entry => <p className="commerce-error" key={entry.code}>{plainText(entry.message)}</p>)}
        <button className="commerce-button" disabled={busy || loading || cart.errors.length > 0} onClick={() => void checkout()}>{busy ? "Aguarde…" : "Continuar para pagamento →"}</button>
        <Link className="cart-drawer-cart-link" href="/cart/" onClick={onClose}>Ver minha sacola</Link>
      </> : null}
      <button className="commerce-text-button" onClick={onClose}>Continuar comprando</button>
    </footer>
  </dialog>;
}

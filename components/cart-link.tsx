"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function CartLink({ mobile = false }: { mobile?: boolean }) {
  const { cart } = useCart();
  const count = cart?.items_count ?? 0;
  return <Link href="/cart/" className={mobile ? "mobile-cart-link" : "header-icon-button cart-link"} aria-label={`Sacola, ${count} ${count === 1 ? "item" : "itens"}`}>
    <svg className="header-line-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5h14l-.75 12H5.75L5 8.5Z" /><path d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9" /></svg>
    {mobile ? <span>Sacola{count ? ` (${count})` : ""}</span> : count ? <span className="cart-count" aria-hidden="true">{count}</span> : null}
  </Link>;
}

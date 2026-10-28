"use client";

import { useCart } from "@/components/cart-provider";
import { plainText } from "@/lib/plain-text";

export function CartUndo() {
  const { removedItem, undoRemove, busy, loading } = useCart();
  if (!removedItem) return null;
  return <div className="cart-undo">
    <p role="status">{plainText(removedItem.name)} foi removido da sacola.</p>
    <button type="button" className="commerce-text-button" disabled={busy || loading} onClick={() => void undoRemove()}>Desfazer remoção</button>
  </div>;
}

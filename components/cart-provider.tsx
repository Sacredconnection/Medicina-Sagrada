"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { WooCart } from "@/lib/cart-types";
import type { CartAction } from "@/lib/cart-validation";

type CartContextValue = {
  cart: WooCart | null;
  busy: boolean;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  mutate: (action: CartAction) => Promise<boolean>;
  checkout: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<WooCart | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const operation = useRef(false);
  const requestVersion = useRef(0);
  const channel = useRef<BroadcastChannel | null>(null);

  const refresh = useCallback(async () => {
    if (operation.current) return;
    const version = ++requestVersion.current;
    setLoading(true);
    try {
      const response = await fetch("/api/cart/", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (version === requestVersion.current) { setCart(data.cart); setError(""); }
    } catch (failure) {
      if (version === requestVersion.current) setError(failure instanceof Error ? failure.message : "Não foi possível carregar a sacola.");
    } finally { if (version === requestVersion.current) setLoading(false); }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void refresh(); }, 0);
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) void refresh(); };
    window.addEventListener("pageshow", onPageShow);
    if (typeof BroadcastChannel !== "undefined") {
      channel.current = new BroadcastChannel("ms-cart-updates");
      channel.current.onmessage = onFocus;
    }
    return () => { window.clearTimeout(initialLoad); window.removeEventListener("focus", onFocus); window.removeEventListener("pageshow", onPageShow); channel.current?.close(); };
  }, [refresh]);

  const mutate = useCallback(async (action: CartAction) => {
    if (operation.current) return false;
    operation.current = true;
    ++requestVersion.current;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/cart/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCart(data.cart);
      channel.current?.postMessage("updated");
      return true;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Não foi possível atualizar a sacola.");
      // A timed-out mutation may have succeeded upstream. Reconcile without
      // replaying the write, which could add the same product twice.
      try {
        const response = await fetch("/api/cart/", { cache: "no-store" });
        if (response.ok) setCart((await response.json()).cart);
      } catch { /* Keep last confirmed state and display the error. */ }
      return false;
    } finally { operation.current = false; setBusy(false); setLoading(false); }
  }, []);

  const checkout = useCallback(async () => {
    if (operation.current) return;
    operation.current = true;
    ++requestVersion.current;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/checkout/", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.assign(data.url);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Não foi possível abrir o pagamento."); }
    finally { operation.current = false; setBusy(false); }
  }, []);

  return <CartContext.Provider value={{ cart, busy, loading, error, refresh, mutate, checkout }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("CartProvider não encontrado.");
  return context;
}

"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { WooImage } from "@/lib/types";

type VariationPhoto = { id: number; image?: WooImage };
type VariationContext = {
  variation: VariationPhoto | null;
  setVariation: (variation: VariationPhoto | null) => void;
};

const ProductVariationContext = createContext<VariationContext | null>(null);

export function ProductVariationProvider({ children }: { children: ReactNode }) {
  const [variation, setVariation] = useState<VariationPhoto | null>(null);
  return <ProductVariationContext.Provider value={{ variation, setVariation }}>{children}</ProductVariationContext.Provider>;
}

export function useProductVariation() {
  const context = useContext(ProductVariationContext);
  if (!context) throw new Error("ProductVariationProvider ausente na página do produto.");
  return context;
}

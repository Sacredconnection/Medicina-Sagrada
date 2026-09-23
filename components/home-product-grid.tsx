"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { ProductCard } from "@/components/product-card";
import type { WooProduct } from "@/lib/types";

const HOME_PRODUCT_LIMIT = 8;
const PREVIOUS_PRODUCTS_KEY = "medicina-sagrada:home-products";
const subscribe = (onStoreChange: () => void) => {
  const timeoutId = window.setTimeout(onStoreChange, 0);
  return () => window.clearTimeout(timeoutId);
};

const shuffleProducts = (products: WooProduct[]) => {
  const shuffled = [...products];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

const selectProducts = (products: WooProduct[], previousIds: number[]) => {
  const selection = shuffleProducts(products).slice(0, HOME_PRODUCT_LIMIT);
  const previousSet = new Set(previousIds);
  const repeatsPreviousSet =
    selection.length === previousIds.length &&
    selection.every(({ id }) => previousSet.has(id));

  if (repeatsPreviousSet && products.length > HOME_PRODUCT_LIMIT) {
    const replacement = products.find(({ id }) => !previousSet.has(id));
    if (replacement) selection[selection.length - 1] = replacement;
  } else if (
    repeatsPreviousSet &&
    selection.length > 1 &&
    selection.every(({ id }, index) => id === previousIds[index])
  ) {
    selection.push(selection.shift() as WooProduct);
  }

  return selection;
};

const readPreviousProductIds = () => {
  if (typeof window === "undefined") return [];

  try {
    const storedIds = JSON.parse(
      window.sessionStorage.getItem(PREVIOUS_PRODUCTS_KEY) ?? "[]",
    ) as unknown;

    return Array.isArray(storedIds) &&
      storedIds.every((id) => typeof id === "number")
      ? storedIds
      : [];
  } catch {
    return [];
  }
};

const createProductSelection = (products: WooProduct[]) => {
  const serverSelection = products.slice(0, HOME_PRODUCT_LIMIT);
  const browserSelection = selectProducts(products, readPreviousProductIds());

  return {
    getServerSnapshot: () => serverSelection,
    getSnapshot: () => browserSelection,
  };
};

export function HomeProductGrid({ products }: { products: WooProduct[] }) {
  const selection = useMemo(
    () => createProductSelection(products),
    [products],
  );
  const visibleProducts = useSyncExternalStore(
    subscribe,
    selection.getSnapshot,
    selection.getServerSnapshot,
  );

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        PREVIOUS_PRODUCTS_KEY,
        JSON.stringify(visibleProducts.map(({ id }) => id)),
      );
    } catch {
      // A seleção continua funcionando quando o armazenamento está indisponível.
    }
  }, [visibleProducts]);

  return (
    <div className="product-grid home-product-grid">
      {visibleProducts.map((product) => (
        <ProductCard key={product.id} product={product} headingLevel={3} />
      ))}
    </div>
  );
}

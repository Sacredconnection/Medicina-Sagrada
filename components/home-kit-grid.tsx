"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";

type KitBanner = {
  href: string;
  title: string;
  label: string;
  image: string;
  fallbackImage: string;
};

const SESSION_FEATURED_KEY = "medicina-sagrada:featured-kit-session";
const PREVIOUS_FEATURED_KEY = "medicina-sagrada:featured-kit-previous";

const subscribe = (onStoreChange: () => void) => {
  const timeoutId = window.setTimeout(onStoreChange, 0);
  return () => window.clearTimeout(timeoutId);
};

const moveFeaturedFirst = (banners: readonly KitBanner[], href: string) => {
  const featuredIndex = banners.findIndex((banner) => banner.href === href);
  if (featuredIndex <= 0) return [...banners];

  return [
    banners[featuredIndex],
    ...banners.slice(0, featuredIndex),
    ...banners.slice(featuredIndex + 1),
  ];
};

const selectKitOrder = (banners: readonly KitBanner[]) => {
  if (typeof window === "undefined" || banners.length === 0) return [...banners];

  try {
    const sessionFeatured = window.sessionStorage.getItem(SESSION_FEATURED_KEY);
    if (sessionFeatured && banners.some(({ href }) => href === sessionFeatured)) {
      return moveFeaturedFirst(banners, sessionFeatured);
    }

    const previousFeatured = window.localStorage.getItem(PREVIOUS_FEATURED_KEY);
    const previousIndex = banners.findIndex(
      ({ href }) => href === previousFeatured,
    );
    const nextIndex = previousIndex >= 0 ? (previousIndex + 1) % banners.length : 0;

    return moveFeaturedFirst(banners, banners[nextIndex].href);
  } catch {
    return [...banners];
  }
};

const createKitSelection = (banners: readonly KitBanner[]) => {
  const serverSelection = [...banners];
  const browserSelection = selectKitOrder(banners);

  return {
    browserFeaturedHref: browserSelection[0]?.href,
    getServerSnapshot: () => serverSelection,
    getSnapshot: () => browserSelection,
  };
};

export function HomeKitGrid({ banners }: { banners: readonly KitBanner[] }) {
  const selection = useMemo(() => createKitSelection(banners), [banners]);
  const visibleBanners = useSyncExternalStore(
    subscribe,
    selection.getSnapshot,
    selection.getServerSnapshot,
  );

  useEffect(() => {
    if (!selection.browserFeaturedHref) return;

    try {
      window.sessionStorage.setItem(
        SESSION_FEATURED_KEY,
        selection.browserFeaturedHref,
      );
      window.localStorage.setItem(
        PREVIOUS_FEATURED_KEY,
        selection.browserFeaturedHref,
      );
    } catch {
      // Mantém a ordem padrão quando o armazenamento do navegador está indisponível.
    }
  }, [selection.browserFeaturedHref]);

  return (
    <div className="kits-grid">
      {visibleBanners.map((banner) => (
        <Link
          className="kit-card"
          href={banner.href}
          key={banner.href}
          style={
            {
              "--kit-image": `url("${banner.image}")`,
              "--kit-fallback-image": `url("${banner.fallbackImage}")`,
            } as CSSProperties
          }
        >
          <span className="kit-card-content">
            <strong>{banner.title}</strong>
            <span className="kit-card-link">{banner.label}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

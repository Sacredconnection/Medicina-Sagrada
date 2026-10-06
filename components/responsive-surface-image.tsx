"use client";

import { getImageProps } from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  mobileSrc?: string;
  fallbackSrc?: string;
  fallbackMobileSrc?: string;
  sizes?: string;
  eager?: boolean;
  mobileBreakpoint?: number;
  className?: string;
};

/** Decorative cover image; only request the fallback after the primary fails. */
export function ResponsiveSurfaceImage({ src, mobileSrc, fallbackSrc, fallbackMobileSrc, sizes = "100vw", eager = false, mobileBreakpoint = 800, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const desktop = failed && fallbackSrc ? fallbackSrc : src;
  const mobile = failed ? fallbackMobileSrc ?? fallbackSrc ?? mobileSrc : mobileSrc;
  const options = {
    alt: "", fill: true, sizes,
    loading: eager ? "eager" as const : "lazy" as const,
    fetchPriority: eager ? "high" as const : "auto" as const,
    // Keep development's live asset-version query strings out of the optimizer.
    unoptimized: process.env.NODE_ENV === "development",
    style: { objectFit: "cover" as const },
  };
  const { props } = getImageProps({ ...options, src: desktop });
  const mobileProps = mobile ? getImageProps({ ...options, src: mobile }).props : null;

  return <picture className={`surface-image ${className}`}>
    {mobileProps ? <source media={`(max-width: ${mobileBreakpoint}px)`} srcSet={mobileProps.srcSet ?? mobileProps.src} sizes={sizes} /> : null}
    {/* getImageProps supplies optimized src/srcSet and the native loading hints. */}
    <img {...props} alt="" onError={() => { if (!failed && (fallbackSrc || fallbackMobileSrc)) setFailed(true); }} />
  </picture>;
}

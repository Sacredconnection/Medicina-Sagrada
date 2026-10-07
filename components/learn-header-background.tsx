"use client";

import { useEffect, useRef, useState } from "react";
import { ResponsiveSurfaceImage } from "@/components/responsive-surface-image";

const backgrounds = [
  { variable: "--learn-header-desktop", path: "/assets/aprenda/banners/aprenda-cabecalho-desktop.webp" },
  { variable: "--learn-header-mobile", path: "/assets/aprenda/banners/aprenda-cabecalho-mobile.webp" },
] as const;

export function LearnHeaderBackground() {
  const marker = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState({ desktop: backgrounds[0].path as string, mobile: backgrounds[1].path as string });

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const header = marker.current?.closest<HTMLElement>(".learn-intro-home");
    if (!header) return;
    let active = true;
    let supported = true;
    let timer: ReturnType<typeof setTimeout>;
    const versions = new Map<string, string>();

    const refresh = async () => {
      await Promise.all(backgrounds.map(async ({ variable, path }) => {
        try {
          const response = await fetch(`/api/dev/asset-version/?path=${encodeURIComponent(path)}`, { cache: "no-store" });
          if (response.status === 204) { supported = false; return; }
          if (!response.ok) return;
          const { version } = await response.json() as { version: string | null };
          if (!version || version === versions.get(path)) return;
          const url = `${path}?v=${encodeURIComponent(version)}`;
          const image = new Image();
          image.src = url;
          await image.decode();
          if (!active) return;
          versions.set(path, version);
          setImages((current) => ({ ...current, [variable === "--learn-header-desktop" ? "desktop" : "mobile"]: url }));
        } catch {
          // Keep the last valid background while an export is being written.
        }
      }));
      if (active && supported) timer = setTimeout(refresh, 750);
    };
    void refresh();
    return () => { active = false; clearTimeout(timer); };
  }, []);

  return <div className="learn-header-image" aria-hidden="true" ref={marker}>
    <ResponsiveSurfaceImage src={images.desktop} mobileSrc={images.mobile} mobileBreakpoint={639} eager />
  </div>;
}

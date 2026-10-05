"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";

export function PartnerLogo({ src, name, initialAvailable }: { src: string; name: string; initialAvailable: boolean }) {
  const [image, setImage] = useState<string | null>(initialAvailable ? src : null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let version: string | null = null;
    const refresh = async () => {
      let supported = true;
      try {
        const response = await fetch(`/api/dev/asset-version/?path=${encodeURIComponent(src)}`, { cache: "no-store" });
        if (response.status === 204) supported = false;
        else if (response.ok) {
          const data = await response.json() as { version: string | null };
          if (!data.version) {
            version = null;
            if (active) setImage(null);
          } else if (data.version !== version) {
            const url = `${src}?v=${encodeURIComponent(data.version)}`;
            const next = new Image();
            next.src = url;
            await next.decode();
            if (active) { version = data.version; setImage(url); }
          }
        }
      } catch {
        // Keep the current logo while the designer is exporting its replacement.
      }
      if (active && supported) timer = setTimeout(refresh, 750);
    };
    void refresh();
    return () => { active = false; clearTimeout(timer); };
  }, [src]);

  return <span className="partner-logo-slot">
    {image ? <NextImage src={image} alt={name} width={200} height={72} unoptimized onError={() => setImage(null)} /> : <span>{name}</span>}
  </span>;
}

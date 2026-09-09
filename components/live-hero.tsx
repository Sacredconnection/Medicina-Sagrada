"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type LiveHeroProps = {
  children: ReactNode;
  image: string;
};

export function LiveHero({ children, image }: LiveHeroProps) {
  const [currentImage, setCurrentImage] = useState(image);
  const currentVersion = useRef("");

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let active = true;

    const refreshImage = async () => {
      try {
        const response = await fetch(
          `/api/dev/asset-version/?path=${encodeURIComponent(image)}`,
          { cache: "no-store" },
        );

        if (!response.ok) return;

        const data = (await response.json()) as { version?: string };
        if (!data.version || data.version === currentVersion.current) return;

        const nextImage = `${image}?v=${encodeURIComponent(data.version)}`;
        const preload = new Image();

        preload.onload = () => {
          if (!active) return;
          currentVersion.current = data.version ?? "";
          setCurrentImage(nextImage);
        };
        preload.src = nextImage;
      } catch {
        // Mantém a última versão válida enquanto o arquivo está sendo salvo.
      }
    };

    void refreshImage();
    const interval = window.setInterval(refreshImage, 750);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [image]);

  return (
    <section
      className="home-hero"
      style={{ "--hero-image": `url("${currentImage}")` } as CSSProperties}
    >
      {children}
    </section>
  );
}

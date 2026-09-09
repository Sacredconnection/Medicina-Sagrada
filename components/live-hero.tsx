"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type LiveHeroProps = {
  children: ReactNode;
  desktopImage: string;
  mobileImage: string;
};

type HeroImages = {
  desktop: string;
  mobile: string;
};

export function LiveHero({
  children,
  desktopImage,
  mobileImage,
}: LiveHeroProps) {
  const [currentImages, setCurrentImages] = useState<HeroImages>({
    desktop: desktopImage,
    mobile: mobileImage,
  });
  const currentVersions = useRef<Record<keyof HeroImages, string>>({
    desktop: "",
    mobile: "",
  });

  useEffect(() => {
    currentVersions.current = { desktop: "", mobile: "" };

    if (process.env.NODE_ENV !== "development") return;

    let active = true;

    const refreshImage = async (variant: keyof HeroImages, image: string) => {
      try {
        const response = await fetch(
          `/api/dev/asset-version/?path=${encodeURIComponent(image)}`,
          { cache: "no-store" },
        );

        if (!response.ok) return;

        const data = (await response.json()) as { version?: string };
        if (!data.version || data.version === currentVersions.current[variant]) {
          return;
        }

        const nextImage = `${image}?v=${encodeURIComponent(data.version)}`;
        const preload = new Image();

        preload.onload = () => {
          if (!active) return;
          currentVersions.current[variant] = data.version ?? "";
          setCurrentImages((images) => ({ ...images, [variant]: nextImage }));
        };
        preload.src = nextImage;
      } catch {
        // Mantém a última versão válida enquanto o arquivo está sendo salvo.
      }
    };

    const refreshImages = () => {
      void Promise.all([
        refreshImage("desktop", desktopImage),
        refreshImage("mobile", mobileImage),
      ]);
    };

    refreshImages();
    const interval = window.setInterval(refreshImages, 750);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [desktopImage, mobileImage]);

  return (
    <section
      className="home-hero"
      style={
        {
          "--hero-image-desktop": `url("${currentImages.desktop}")`,
          "--hero-image-mobile": `url("${currentImages.mobile}")`,
        } as CSSProperties
      }
    >
      {children}
    </section>
  );
}

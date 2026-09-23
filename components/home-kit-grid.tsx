"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type KitBanner = {
  href: string;
  title: string;
  label: string;
  image: string;
  fallbackImage: string;
};

const KIT_BACKGROUND_PATHS = {
  desktop: "/assets/home/kits/background/medicina-sagrada-kits-background-desktop.webp",
  mobile: "/assets/home/kits/background/medicina-sagrada-kits-background-mobile.webp",
} as const;

type KitBackgroundVariant = keyof typeof KIT_BACKGROUND_PATHS;

function HomeKitGrid({ banners }: { banners: readonly KitBanner[] }) {
  return (
    <div className="kits-grid">
      {banners.map((banner) => (
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

export function HomeKitsSection({ banners }: { banners: readonly KitBanner[] }) {
  const [backgrounds, setBackgrounds] = useState<Record<KitBackgroundVariant, string>>(
    KIT_BACKGROUND_PATHS,
  );
  const backgroundVersions = useRef<Partial<Record<KitBackgroundVariant, string>>>({});

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let active = true;

    const refreshBackground = async (
      variant: KitBackgroundVariant,
      imagePath: string,
    ) => {
      try {
        const response = await fetch(
          `/api/dev/asset-version/?path=${encodeURIComponent(imagePath)}`,
          { cache: "no-store" },
        );

        if (!response.ok) return;

        const data = (await response.json()) as { version?: string | null };
        if (!data.version || data.version === backgroundVersions.current[variant]) {
          return;
        }

        const nextImage = `${imagePath}?v=${encodeURIComponent(data.version)}`;
        const preload = new window.Image();

        preload.onload = () => {
          if (!active) return;
          backgroundVersions.current[variant] = data.version ?? "";
          setBackgrounds((current) => ({ ...current, [variant]: nextImage }));
        };
        preload.src = nextImage;
      } catch {
        // Mantém a última versão válida enquanto o arquivo está sendo salvo.
      }
    };

    const refreshBackgrounds = () => {
      void Promise.all(
        Object.entries(KIT_BACKGROUND_PATHS).map(([variant, imagePath]) =>
          refreshBackground(variant as KitBackgroundVariant, imagePath),
        ),
      );
    };

    refreshBackgrounds();
    const interval = window.setInterval(refreshBackgrounds, 750);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section
      className="kits-section"
      aria-labelledby="kits-title"
      style={
        {
          "--kits-background-desktop": `url("${backgrounds.desktop}")`,
          "--kits-background-mobile": `url("${backgrounds.mobile}")`,
        } as CSSProperties
      }
    >
      <div className="container">
        <div className="kits-section-heading">
          <h2 id="kits-title">Kits para diferentes caminhos</h2>
          <p>
            Reunimos diferentes medicinas em seleções prontas para você conhecer novas combinações e encontrar o kit
            que melhor acompanha a sua intenção.
          </p>
        </div>
        <HomeKitGrid banners={banners} />
        <Link className="button kits-section-cta" href="/product-category/kits/">
          Explorar todos os kits
        </Link>
      </div>
    </section>
  );
}

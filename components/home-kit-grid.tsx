"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import type { HomeKitBanner } from "@/lib/home-content";

const HOME_KIT_LIMIT = 3;
const PREVIOUS_KITS_KEY = "medicina-sagrada:home-kits";

const subscribe = (onStoreChange: () => void) => {
  const timeoutId = window.setTimeout(onStoreChange, 0);
  return () => window.clearTimeout(timeoutId);
};

const shuffleKits = (banners: readonly HomeKitBanner[]) => {
  const shuffled = [...banners];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

const selectKits = (banners: readonly HomeKitBanner[], previousKeys: string[]) => {
  const selection = shuffleKits(banners).slice(0, HOME_KIT_LIMIT);
  const previousSet = new Set(previousKeys);
  const repeatsPreviousSet =
    selection.length === previousKeys.length &&
    selection.every(({ key }) => previousSet.has(key));

  if (repeatsPreviousSet && banners.length > HOME_KIT_LIMIT) {
    const replacement = banners.find(({ key }) => !previousSet.has(key));
    if (replacement) selection[selection.length - 1] = replacement;
  } else if (
    repeatsPreviousSet &&
    selection.length > 1 &&
    selection.every(({ key }, index) => key === previousKeys[index])
  ) {
    selection.push(selection.shift() as HomeKitBanner);
  }

  return selection;
};

const readPreviousKitKeys = () => {
  if (typeof window === "undefined") return [];

  try {
    const storedKeys = JSON.parse(
      window.localStorage.getItem(PREVIOUS_KITS_KEY) ?? "[]",
    ) as unknown;

    return Array.isArray(storedKeys) &&
      storedKeys.every((key) => typeof key === "string")
      ? storedKeys
      : [];
  } catch {
    return [];
  }
};

const createKitSelection = (banners: readonly HomeKitBanner[]) => {
  const serverSelection = banners.slice(0, HOME_KIT_LIMIT);
  const browserSelection = selectKits(banners, readPreviousKitKeys());

  return {
    getServerSnapshot: () => serverSelection,
    getSnapshot: () => browserSelection,
  };
};

const KIT_BACKGROUND_PATHS = {
  desktop: "/assets/home/kits/background/medicina-sagrada-kits-background-desktop.webp",
  mobile: "/assets/home/kits/background/medicina-sagrada-kits-background-mobile.webp",
} as const;

type KitBackgroundVariant = keyof typeof KIT_BACKGROUND_PATHS;

function HomeKitGrid({ banners }: { banners: readonly HomeKitBanner[] }) {
  const selection = useMemo(() => createKitSelection(banners), [banners]);
  const visibleBanners = useSyncExternalStore(
    subscribe,
    selection.getSnapshot,
    selection.getServerSnapshot,
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PREVIOUS_KITS_KEY,
        JSON.stringify(visibleBanners.map(({ key }) => key)),
      );
    } catch {
      // A rotaÃ§Ã£o continua funcionando quando o armazenamento estÃ¡ indisponÃ­vel.
    }
  }, [visibleBanners]);

  return (
    <div className="kits-grid">
      {visibleBanners.map((banner) => (
        <Link
          className="kit-card-item"
          href={banner.href}
          key={banner.key}
          style={
            {
              "--kit-image": `url("${banner.image}")`,
              "--kit-fallback-image": `url("${banner.fallbackImage}")`,
            } as CSSProperties
          }
        >
          <span className="kit-card-content">
            <strong className="kit-card-title">{banner.title}</strong>
          </span>
        </Link>
      ))}
    </div>
  );
}

export function HomeKitsSection({ banners }: { banners: readonly HomeKitBanner[] }) {
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

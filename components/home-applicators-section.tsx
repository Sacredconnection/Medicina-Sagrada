"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const applicators = [
  {
    id: "tepis",
    name: "Tepis",
    featured: true,
    image: "/assets/home/applicators/medicina-sagrada-aplicadores-tepis.webp",
  },
  {
    id: "kuripes",
    name: "Kuripes",
    featured: false,
    image: "/assets/home/applicators/medicina-sagrada-aplicadores-kuripes.webp",
  },
  {
    id: "reservatorios",
    name: "Reservatórios",
    featured: false,
    image: "/assets/home/applicators/medicina-sagrada-aplicadores-reservatorios.webp",
  },
] as const;

type ApplicatorId = (typeof applicators)[number]["id"];

const canonicalImages = Object.fromEntries(
  applicators.map(({ id, image }) => [id, image]),
) as Record<ApplicatorId, string>;

export function HomeApplicatorsSection() {
  const [images, setImages] = useState(canonicalImages);
  const imageVersions = useRef<Partial<Record<ApplicatorId, string>>>({});

  useEffect(() => {
    let active = true;
    let supportsPolling = true;
    let interval: number | undefined;

    const refreshImage = async (id: ApplicatorId, imagePath: string) => {
      try {
        const response = await fetch(
          `/api/dev/asset-version/?path=${encodeURIComponent(imagePath)}`,
          { cache: "no-store" },
        );

        if (response.status === 204) {
          supportsPolling = false;
          return;
        }
        if (!response.ok) return;

        const data = (await response.json()) as { version?: string | null };
        if (!data.version || data.version === imageVersions.current[id]) return;

        const nextImage = `${imagePath}?v=${encodeURIComponent(data.version)}`;
        if (!active) return;

        imageVersions.current[id] = data.version;
        setImages((current) => ({ ...current, [id]: nextImage }));
      } catch {
        // Mantém a última imagem válida enquanto o arquivo está sendo salvo.
      }
    };

    const refreshImages = () =>
      Promise.all(
        applicators.map(({ id, image }) => refreshImage(id, image)),
      );

    const startImageMonitoring = async () => {
      await refreshImages();
      if (!active || !supportsPolling) return;
      interval = window.setInterval(() => void refreshImages(), 750);
    };

    void startImageMonitoring();

    return () => {
      active = false;
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, []);

  return (
    <section className="applicators-section" aria-labelledby="applicators-title">
      <div className="container applicators-layout">
        <div className="applicators-panel">
          <div className="applicators-copy">
            <h2 id="applicators-title">
              <span>Acessórios</span>
              <span>para sua prática</span>
            </h2>
            <p>
              Kuripes, tepis e reservatórios para o preparo, o cuidado e a
              conexão com a medicina.
            </p>
          </div>
          <Link className="button applicators-cta" href="/product-category/acessorios/">
            Explorar acessórios
          </Link>
        </div>

        <div className="applicators-mosaic" aria-label="Tipos de aplicadores">
          {applicators.map((applicator) => (
            <article
              className={`applicator-card${applicator.featured ? " applicator-card-featured" : ""}`}
              data-image-slot={applicator.id}
              key={applicator.id}
              style={
                {
                  "--applicator-image": `url("${images[applicator.id]}")`,
                } as CSSProperties
              }
            >
              <div className="applicator-card-content">
                <h3>{applicator.name}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

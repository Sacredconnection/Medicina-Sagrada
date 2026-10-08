"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { ResponsiveSurfaceImage } from "@/components/responsive-surface-image";

export type HeroSlide = {
  id: string;
  desktopImage: string;
  mobileImage: string;
  fallbackDesktopImage?: string;
  fallbackMobileImage?: string;
  titlePrimary: string;
  titleSecondary: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

type LiveHeroProps = {
  slides: HeroSlide[];
};

type HeroImages = {
  desktop: string;
  mobile: string;
};

const AUTOPLAY_DELAY = 7000;
// Ajuste aqui a quantidade de poeira; no mobile mostramos uma a cada duas.
const DUST_PARTICLE_COUNT = 156;
const dustParticles = Array.from({ length: DUST_PARTICLE_COUNT }, (_, index) => ({
  "--dust-x": `${(index * 37 + 11) % 100}%`,
  "--dust-y": `${(index * 61 + 7) % 100}%`,
  "--dust-size": `${1.5 + ((index * 7) % 6) * 0.5}px`,
  "--dust-opacity": 0.22 + ((index * 3) % 7) * 0.055,
  "--dust-duration": `${18 + ((index * 7) % 17)}s`,
  "--dust-delay": `${-((index * 13) % 35)}s`,
  "--dust-drift": `${20 + ((index * 11) % 55)}px`,
}) as CSSProperties);

export function LiveHero({ slides }: LiveHeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoplayStopped, setIsAutoplayStopped] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [currentImages, setCurrentImages] = useState<HeroImages[]>(() =>
    slides.map((slide) => ({
      desktop:
        process.env.NODE_ENV === "development" && slide.fallbackDesktopImage
          ? slide.fallbackDesktopImage
          : slide.desktopImage,
      mobile:
        process.env.NODE_ENV === "development" && slide.fallbackMobileImage
          ? slide.fallbackMobileImage
          : slide.mobileImage,
    })),
  );
  const currentVersions = useRef<Record<string, string>>({});

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReduceMotion(motionQuery.matches);

    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);

    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (reduceMotion || isPaused || isAutoplayStopped || slides.length < 2) return;

    const interval = window.setInterval(() => {
      if (document.hidden) return;
      setActiveSlide((index) => (index + 1) % slides.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(interval);
  }, [isPaused, isAutoplayStopped, reduceMotion, slides.length]);

  useEffect(() => {
    currentVersions.current = {};

    if (process.env.NODE_ENV !== "development") return;

    let active = true;

    const refreshImage = async (
      slideIndex: number,
      variant: keyof HeroImages,
      image: string,
    ) => {
      try {
        const response = await fetch(
          `/api/dev/asset-version/?path=${encodeURIComponent(image)}`,
          { cache: "no-store" },
        );

        if (!response.ok) return;

        const data = (await response.json()) as { version?: string | null };
        const versionKey = `${slideIndex}-${variant}`;
        if (!data.version || data.version === currentVersions.current[versionKey]) {
          return;
        }

        const nextImage = `${image}?v=${encodeURIComponent(data.version)}`;
        const preload = new Image();

        preload.onload = () => {
          if (!active) return;
          currentVersions.current[versionKey] = data.version ?? "";
          setCurrentImages((images) =>
            images.map((slideImages, index) =>
              index === slideIndex
                ? { ...slideImages, [variant]: nextImage }
                : slideImages,
            ),
          );
        };
        preload.src = nextImage;
      } catch {
        // Mantém a última versão válida enquanto o arquivo está sendo salvo.
      }
    };

    const refreshImages = () => {
      void Promise.all(
        slides.flatMap((slide, index) => [
          refreshImage(index, "desktop", slide.desktopImage),
          refreshImage(index, "mobile", slide.mobileImage),
        ]),
      );
    };

    refreshImages();
    const interval = window.setInterval(refreshImages, 750);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [slides]);

  return (
    <section
      aria-label="Destaques da Medicina Sagrada"
      aria-roledescription="carrossel"
      className="home-hero"
      data-dust-paused={isAutoplayStopped || undefined}
      onBlurCapture={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeSlide;
        const images = currentImages[index] ?? {
          desktop: slide.desktopImage,
          mobile: slide.mobileImage,
        };

        return (
          <div
            aria-hidden={!isActive}
            className={`home-hero-slide${isActive ? " is-active" : ""}`}
            inert={isActive ? undefined : true}
            key={slide.id}
          >
            <ResponsiveSurfaceImage key={`${images.desktop}:${images.mobile}`} src={images.desktop} mobileSrc={images.mobile} fallbackSrc={slide.fallbackDesktopImage} fallbackMobileSrc={slide.fallbackMobileImage} eager={isActive} />
            <div aria-hidden="true" className="hero-dust">
              {dustParticles.map((style, particleIndex) => (
                <span className="hero-dust-particle" key={particleIndex} style={style} />
              ))}
            </div>
            <div className="container home-hero-inner">
              <div className="home-hero-copy">
                <h1 className="hero-title">
                  <span className="hero-title-primary">{slide.titlePrimary}</span>
                  <span className="hero-title-secondary">{slide.titleSecondary}</span>
                </h1>
                <p>{slide.description}</p>
                <div className="hero-actions">
                  <div className="hero-journey-wrapper">
                    <Link className="hero-journey-cta" href={slide.ctaHref}>
                      <span className="hero-journey-label">{slide.ctaLabel}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div aria-label="Controles dos banners" className="hero-carousel-pagination" role="group">
        {slides.length > 1 && !reduceMotion && (
          <button
            aria-label={isAutoplayStopped ? "Retomar rotação dos banners" : "Pausar rotação dos banners"}
            aria-pressed={isAutoplayStopped}
            className="hero-carousel-autoplay"
            onClick={() => setIsAutoplayStopped((stopped) => !stopped)}
            type="button"
          >
            {isAutoplayStopped ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <path d="m9 6 9 6-9 6V6Z" fill="currentColor" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <path d="M8 6v12M16 6v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}
        {slides.map((slide, index) => (
          <button
            aria-label={`Mostrar banner ${index + 1} de ${slides.length}`}
            aria-pressed={activeSlide === index}
            className="hero-carousel-dot"
            key={slide.id}
            onClick={() => setActiveSlide(index)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

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

export function LiveHero({ slides }: LiveHeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
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
    if (reduceMotion || isPaused || slides.length < 2) return;

    const interval = window.setInterval(() => {
      if (document.hidden) return;
      setActiveSlide((index) => (index + 1) % slides.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(interval);
  }, [isPaused, reduceMotion, slides.length]);

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
            style={
              {
                "--hero-slide-image-desktop": `url("${images.desktop}")`,
                "--hero-slide-image-mobile": `url("${images.mobile}")`,
                "--hero-slide-fallback-desktop": `url("${slide.fallbackDesktopImage ?? images.desktop}")`,
                "--hero-slide-fallback-mobile": `url("${slide.fallbackMobileImage ?? images.mobile}")`,
              } as CSSProperties
            }
          >
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

      <div aria-label="Selecionar banner" className="hero-carousel-pagination" role="group">
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

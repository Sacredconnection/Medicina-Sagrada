"use client";

import { useEffect, useRef } from "react";

type BenefitIconName = "delivery" | "partnership" | "secure" | "support";

const AUTOPLAY_INTERVAL = 3600;
const INTERACTION_PAUSE = 8000;

const benefits: Array<{ icon: BenefitIconName; title: string; detail: string }> = [
  {
    icon: "delivery",
    title: "Envio para todo o Brasil",
    detail: "Receba seu pedido com cuidado",
  },
  {
    icon: "partnership",
    title: "Parcerias responsáveis",
    detail: "Relações que valorizam a origem",
  },
  {
    icon: "secure",
    title: "Compra segura",
    detail: "Pagamento protegido no checkout",
  },
  {
    icon: "support",
    title: "Atendimento próximo",
    detail: "Estamos aqui para ajudar",
  },
];

function BenefitIcon({ name }: { name: BenefitIconName }) {
  return (
    <svg className="benefit-icon" aria-hidden="true" viewBox="0 0 24 24">
      {name === "delivery" && (
        <>
          <path d="M3 6.5h11v10H3z" />
          <path d="M14 10h3.2l3.3 3.5v3H14zM6.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </>
      )}
      {name === "partnership" && (
        <>
          <circle cx="8" cy="8" r="2.5" />
          <circle cx="16" cy="8" r="2.5" />
          <path d="M3.5 18c.4-3 2-4.5 4.5-4.5s4.1 1.5 4.5 4.5M11.5 18c.4-3 2-4.5 4.5-4.5s4.1 1.5 4.5 4.5" />
        </>
      )}
      {name === "secure" && (
        <>
          <path d="M12 3.5 19 6v5.2c0 4.3-2.6 7.7-7 9.3-4.4-1.6-7-5-7-9.3V6z" />
          <path d="m8.8 11.8 2.1 2.1 4.4-4.5" />
        </>
      )}
      {name === "support" && (
        <>
          <path d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" />
          <path d="M4.5 12.5h2.8v5H5.5a1 1 0 0 1-1-1zM19.5 12.5h-2.8v5h1.8a1 1 0 0 0 1-1zM16.7 17.5c-.6 1.8-2 2.5-4.2 2.5" />
        </>
      )}
    </svg>
  );
}

export function BenefitsStrip() {
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) return;

    const mobileQuery = window.matchMedia("(max-width: 800px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isVisible = false;
    let direction = 1;
    let autoplayTimer: number | undefined;
    let resumeTimer: number | undefined;

    const stopAutoplay = () => {
      if (autoplayTimer !== undefined) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = undefined;
      }
    };

    const getItems = () =>
      Array.from(rail.querySelectorAll<HTMLElement>(".benefit-item"));

    const getNearestIndex = (items: HTMLElement[]) => {
      const paddingStart = Number.parseFloat(
        window.getComputedStyle(rail).paddingInlineStart,
      );
      const currentPosition = rail.scrollLeft + paddingStart;

      return items.reduce((nearestIndex, item, itemIndex) => {
        const nearestDistance = Math.abs(
          items[nearestIndex].offsetLeft - currentPosition,
        );
        const itemDistance = Math.abs(item.offsetLeft - currentPosition);

        return itemDistance < nearestDistance ? itemIndex : nearestIndex;
      }, 0);
    };

    const advance = () => {
      const items = getItems();

      if (items.length < 2) return;

      const currentIndex = getNearestIndex(items);
      let nextIndex = currentIndex + direction;

      if (nextIndex >= items.length) {
        direction = -1;
        nextIndex = items.length - 2;
      } else if (nextIndex < 0) {
        direction = 1;
        nextIndex = 1;
      }

      const paddingStart = Number.parseFloat(
        window.getComputedStyle(rail).paddingInlineStart,
      );

      rail.scrollTo({
        behavior: "smooth",
        left: Math.max(0, items[nextIndex].offsetLeft - paddingStart),
      });
    };

    const canAutoplay = () =>
      mobileQuery.matches &&
      !reducedMotionQuery.matches &&
      isVisible &&
      document.visibilityState === "visible";

    const startAutoplay = () => {
      stopAutoplay();

      if (canAutoplay()) {
        autoplayTimer = window.setInterval(advance, AUTOPLAY_INTERVAL);
      }
    };

    const pauseAfterInteraction = () => {
      stopAutoplay();

      if (resumeTimer !== undefined) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(startAutoplay, INTERACTION_PAUSE);
    };

    const handleVisibilityChange = () => startAutoplay();
    const handlePreferenceChange = () => startAutoplay();
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        startAutoplay();
      },
      { threshold: 0.35 },
    );

    observer.observe(rail);
    rail.addEventListener("pointerdown", pauseAfterInteraction, { passive: true });
    rail.addEventListener("wheel", pauseAfterInteraction, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    mobileQuery.addEventListener("change", handlePreferenceChange);
    reducedMotionQuery.addEventListener("change", handlePreferenceChange);

    return () => {
      stopAutoplay();
      if (resumeTimer !== undefined) window.clearTimeout(resumeTimer);
      observer.disconnect();
      rail.removeEventListener("pointerdown", pauseAfterInteraction);
      rail.removeEventListener("wheel", pauseAfterInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      mobileQuery.removeEventListener("change", handlePreferenceChange);
      reducedMotionQuery.removeEventListener("change", handlePreferenceChange);
    };
  }, []);

  return (
    <section className="benefits-strip" aria-label="Benefícios da loja">
      <div className="container benefits-grid" ref={railRef}>
        {benefits.map((benefit) => (
          <div className="benefit-item" key={benefit.title}>
            <BenefitIcon name={benefit.icon} />
            <div className="benefit-copy">
              <strong>{benefit.title}</strong>
              <span>{benefit.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

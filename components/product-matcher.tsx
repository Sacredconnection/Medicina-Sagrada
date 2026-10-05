"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { plainText } from "@/lib/plain-text";
import { canonicalizeEthnicityNames } from "@/lib/ethnicity-colors";
import type { RitualRecommendationResult } from "@/lib/ritual-recommendation";
import {
  ritualExperienceOptions,
  ritualIntentions,
  ritualsData,
  type RitualExperienceId,
  type RitualIntentionId,
  type RitualKey,
} from "@/lib/rituals-data";
import { getRitualCatalogFallback } from "@/lib/ritual-product-selection";
import type { WooProduct } from "@/lib/types";
import type { RitualCatalogProduct } from "@/lib/ritual-catalog";
import ritualImages from "@/public/assets/home/matcher/products/manifest.json";
import ritualVariationImages from "@/public/assets/home/matcher/products/variations.json";

type FinderStep = "intro" | "intention" | "experience" | "result";

const finderStepOrder: FinderStep[] = ["intro", "intention", "experience", "result"];

const MATCHER_LIVE_IMAGE_PATHS = {
  desktop: "/assets/home/matcher/medicina-sagrada-ritual-finder-intro-background.webp",
  mobile: "/assets/home/matcher/medicina-sagrada-ritual-finder-intro-background-mobile.webp",
  grounding: "/assets/home/matcher/intro-intentions/aterramento-presenca.webp",
  strength: "/assets/home/matcher/intro-intentions/forca-coragem.webp",
  serenity: "/assets/home/matcher/intro-intentions/silencio-mental-paz.webp",
  heart: "/assets/home/matcher/intro-intentions/abertura-coracao.webp",
  purification: "/assets/home/matcher/intro-intentions/purificacao-limpeza.webp",
} as const satisfies Record<"desktop" | "mobile" | RitualIntentionId, string>;

type MatcherLiveImageKey = keyof typeof MATCHER_LIVE_IMAGE_PATHS;

const MATCHER_INITIAL_IMAGES: Record<MatcherLiveImageKey, string> = {
  desktop: MATCHER_LIVE_IMAGE_PATHS.desktop,
  mobile: MATCHER_LIVE_IMAGE_PATHS.mobile,
  grounding: MATCHER_LIVE_IMAGE_PATHS.grounding,
  strength: MATCHER_LIVE_IMAGE_PATHS.strength,
  serenity: MATCHER_LIVE_IMAGE_PATHS.serenity,
  heart: MATCHER_LIVE_IMAGE_PATHS.heart,
  purification: MATCHER_LIVE_IMAGE_PATHS.purification,
};

const progressSteps = [
  { id: "intention", label: "Intenção", icon: "explore" },
  { id: "experience", label: "Experiência", icon: "self_improvement" },
  { id: "result", label: "Ritual", icon: "local_fire" },
] as const;

function ProgressIcon({ icon }: { icon: (typeof progressSteps)[number]["icon"] }) {
  return (
    <svg
      aria-hidden="true"
      className="matcher-progress-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      {icon === "explore" ? (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
        </>
      ) : icon === "self_improvement" ? (
        <>
          <circle cx="12" cy="8" r="3" />
          <path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6" />
        </>
      ) : (
        <path d="M12 21c3.9 0 6.5-2.6 6.5-6.2 0-2.5-1.3-4.3-3-6.2-.4 2-1.2 3-2.2 3.8.2-4-1.5-6.9-4.7-9.2.3 3.5-3.1 5.5-3.1 9.5C5.5 17.5 8.2 21 12 21Z" />
      )}
    </svg>
  );
}

const productHref = (product: Pick<RitualCatalogProduct, "slug">) => `/product/${product.slug}/`;

const getAmount = (product: Pick<RitualCatalogProduct, "prices">) => {
  const rawAmount = product.prices.price_range?.min_amount ?? product.prices.price;
  return Number(rawAmount) / 10 ** product.prices.currency_minor_unit;
};

const formatAmount = (amount: number, product: Pick<RitualCatalogProduct, "prices">) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: product.prices.currency_code,
  }).format(amount);

function FinderImage({ image, alt, localSrc, fallbackSrc }: { image: WooProduct["images"][number]; alt: string; localSrc?: string; fallbackSrc?: string }) {
  const [source, setSource] = useState(0);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (loaded || source >= 2) return;
    const timer = setTimeout(() => setSource((current) => current + 1), 3500);
    return () => clearTimeout(timer);
  }, [loaded, source]);
  return source < 2 ? (
    <Image
      alt={alt}
      fill
      sizes="(max-width: 700px) 35vw, 18rem"
      src={source === 0 ? localSrc || image.thumbnail || image.src : fallbackSrc || image.src}
      unoptimized={Boolean(localSrc) || source > 0}
      onLoad={() => setLoaded(true)}
      onError={() => { setLoaded(false); setSource((current) => current + 1); }}
    />
  ) : <span>Foto temporariamente indisponível</span>;
}

function FinderProduct({
  kind,
  suggestedSlug,
  product,
  detail,
  variations = [],
  selectedVariationId,
  onVariationChange,
  selectionLabel = "Escolha uma opção",
  onVariationResolved,
}: {
  kind: string;
  product: RitualCatalogProduct | undefined;
  detail: string;
  variations?: WooProduct[];
  selectedVariationId?: number | null;
  onVariationChange?: (variationId: number) => void;
  selectionLabel?: string;
  suggestedSlug?: string;
  onVariationResolved?: (variation: WooProduct) => void;
}) {
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [variationError, setVariationError] = useState("");
  const variationRequest = useRef<AbortController | null>(null);
  useEffect(() => () => variationRequest.current?.abort(), []);
  if (!product) {
    return (
      <article className="ritual-product ritual-product-unavailable">
        <h3>{suggestedSlug ? canonicalizeEthnicityNames(suggestedSlug.replace(/-/g, " ")) : "Produto temporariamente indisponível"}</h3>
        <p className="ritual-product-kind">{kind}</p>
        <p>{detail}</p>
        {suggestedSlug ? (
          <Link className="button" href={`/product/${suggestedSlug}/`}>Ver produto</Link>
        ) : <Link href="/product-category/rape/">Ver opções no catálogo</Link>}
      </article>
    );
  }

  const selectedVariation = variations.find(({ id }) => id === selectedVariationId);
  const displayedProduct = selectedVariation ?? product;
  const localVariationImage = selectedVariationId
    ? (ritualVariationImages as Record<string, { src: string; original: string; label: string }>)[selectedVariationId]
    : undefined;
  const remoteImage = displayedProduct.images[0] ?? product.images[0];
  const image = localVariationImage
    ? { ...remoteImage, src: localVariationImage.original, thumbnail: localVariationImage.src, alt: `${plainText(product.name)} — ${localVariationImage.label}` }
    : remoteImage;
  const localImage = (ritualImages as Record<string, { src: string; original: string }>)[product.slug];
  const options = product.variations?.length ? product.variations : variations.map((variation) => ({
    id: variation.id, attributes: [{ name: "Opção", value: plainText(variation.variation ?? variation.name) }],
  }));

  return (
    <article className="ritual-product">
      <Link
        aria-hidden="true"
        className="ritual-product-image"
        href={productHref(product)}
        tabIndex={-1}
      >
        {image ? (
          <FinderImage
            key={image.src}
            localSrc={localVariationImage?.src ?? (localImage?.original === image.src ? localImage.src : undefined)}
            fallbackSrc={localVariationImage?.src ?? (localImage?.original === image.src ? localImage.src : undefined)}
            alt={image.alt || canonicalizeEthnicityNames(plainText(product.name))}
            image={image}
          />
        ) : (
          <span>Imagem indisponível</span>
        )}
      </Link>
      <div className="ritual-product-copy">
        <h3>
          <Link href={productHref(product)}>{canonicalizeEthnicityNames(plainText(product.name))}</Link>
        </h3>
        <p className="ritual-product-kind">{kind}</p>
        <p>{detail}</p>
        {options.length && onVariationChange ? (
          <fieldset className="ritual-weight-picker">
            <legend>{selectionLabel}</legend>
            <div className="ritual-weight-options" role="radiogroup" aria-label={selectionLabel}>
              {options.map((option) => {
                const variation = variations.find(({ id }) => id === option.id);
                const label = option.attributes.map(({ value }) => value).join(" / ");
                const available =
                  variation?.is_in_stock !== false && variation?.is_purchasable !== false;
                return (
                  <button
                    aria-checked={option.id === selectedVariationId}
                    aria-label={`${label}${variation ? `, ${formatAmount(getAmount(variation), variation)}` : ""}${available ? "" : ", esgotado"}`}
                    className="ritual-weight-option"
                    disabled={!available}
                    key={option.id}
                    onClick={async () => {
                      variationRequest.current?.abort();
                      setVariationError("");
                      onVariationChange(option.id);
                      if (variation) { setCheckingId(null); return; }
                      const controller = new AbortController();
                      variationRequest.current = controller;
                      setCheckingId(option.id);
                      try {
                        const response = await fetch(`/api/ritual-variation/?id=${option.id}`, {
                          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20_000)]),
                        });
                        if (!response.ok) throw new Error("variation unavailable");
                        const resolved = await response.json() as WooProduct;
                        if (!controller.signal.aborted) onVariationResolved?.(resolved);
                      } catch {
                        if (!controller.signal.aborted) setVariationError("Não conseguimos confirmar preço e estoque. Toque no peso ou modelo para tentar novamente.");
                      } finally {
                        if (!controller.signal.aborted) setCheckingId(null);
                      }
                    }}
                    role="radio"
                    type="button"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {checkingId ? <p role="status">Confirmando preço e estoque…</p> : null}
            {variationError ? <p role="alert">{variationError}</p> : null}
          </fieldset>
        ) : null}
        <div className="ritual-product-footer">
          <strong aria-live="polite" aria-atomic="true">
            {selectedVariationId && !selectedVariation ? (checkingId ? "Consultando preço…" : "Preço indisponível") : <>
              {selectedVariation ? "" : product.type === "variable" ? "A partir de " : ""}
              {formatAmount(getAmount(displayedProduct), displayedProduct)}
            </>}
          </strong>
          <Link href={productHref(product)}>Ver produto</Link>
        </div>
      </div>
    </article>
  );
}

export function ProductMatcher({ products, introTitle }: { products: RitualCatalogProduct[]; introTitle?: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { busy: cartBusy, error: cartError, loading: cartLoading, mutate, refresh: refreshCart } = useCart();
  const imageVersions = useRef<Record<MatcherLiveImageKey, string>>({
    desktop: "",
    mobile: "",
    grounding: "",
    strength: "",
    serenity: "",
    heart: "",
    purification: "",
  });
  const [step, setStep] = useState<FinderStep>("intro");
  const [direction, setDirection] = useState(1);
  const [intention, setIntention] = useState<RitualIntentionId | null>(null);
  const [experience, setExperience] = useState<RitualExperienceId | null>(null);
  const [selectedVariationId, setSelectedVariationId] = useState<number | null>(null);
  const [selectedApplicatorVariationId, setSelectedApplicatorVariationId] = useState<number | null>(null);
  const [ritualResult, setRitualResult] = useState<RitualRecommendationResult | null>(null);
  const [confirmedVariations, setConfirmedVariations] = useState<Record<number, WooProduct>>({});
  const [resultState, setResultState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [liveImages, setLiveImages] = useState(MATCHER_INITIAL_IMAGES);

  const recommendation = useMemo(() => {
    if (!intention || !experience) return null;
    return ritualsData[`${intention}:${experience}` as RitualKey];
  }, [experience, intention]);

  const catalogFallback = useMemo(() => recommendation
    ? getRitualCatalogFallback(recommendation.produtoPrincipal.candidatos, recommendation.aplicador.slug, products)
    : null, [recommendation, products]);
  const visibleResult = ritualResult ?? catalogFallback;
  const primaryProduct = visibleResult?.primary?.product;
  const primaryRecommendation = useMemo(
    () =>
      recommendation?.produtoPrincipal.candidatos.find(
        ({ slug }) => slug === primaryProduct?.slug,
      ),
    [primaryProduct?.slug, recommendation],
  );
  const applicator = visibleResult?.applicator?.product;

  const mergeVariations = (product: RitualCatalogProduct | undefined, variations: WooProduct[]) =>
    [...new Map([
      ...variations,
      ...(product?.variations ?? []).flatMap(({ id }) => confirmedVariations[id] ? [confirmedVariations[id]] : []),
    ].map((variation) => [variation.id, variation])).values()];
  const primaryVariations = primaryProduct
    ? mergeVariations(primaryProduct, ritualResult?.primary?.variations ?? []).sort(
        (first, second) => getAmount(first) - getAmount(second),
      )
    : [];
  const selectedVariation = primaryVariations.find(
    ({ id }) => id === selectedVariationId,
  );
  const applicatorVariations = applicator
    ? mergeVariations(applicator, ritualResult?.applicator?.variations ?? []).sort(
        (first, second) => getAmount(first) - getAmount(second),
      )
    : [];
  const selectedApplicatorVariation = applicatorVariations.find(
    ({ id }) => id === selectedApplicatorVariationId,
  );

  const goToStep = (nextStep: FinderStep) => {
    setDirection(
      finderStepOrder.indexOf(nextStep) >= finderStepOrder.indexOf(step) ? 1 : -1,
    );
    setStep(nextStep);
  };

  const reset = () => {
    setIntention(null);
    setExperience(null);
    setRitualResult(null);
    setResultState("idle");
    setSelectedVariationId(null);
    setSelectedApplicatorVariationId(null);
    goToStep("intention");
  };

  const primaryNeedsWeight = primaryProduct?.type === "variable";
  const pricedPrimaryProduct = primaryNeedsWeight ? selectedVariation : primaryProduct;
  const applicatorNeedsVariation = applicator?.type === "variable";
  const pricedApplicator = applicatorNeedsVariation ? selectedApplicatorVariation : applicator;
  const primaryCanBeAdded = Boolean(
    pricedPrimaryProduct &&
      pricedPrimaryProduct.is_in_stock !== false &&
      pricedPrimaryProduct.is_purchasable !== false,
  );
  const applicatorCanBeAdded = Boolean(
    pricedApplicator &&
      pricedApplicator.is_in_stock !== false &&
      pricedApplicator.is_purchasable !== false,
  );
  const bundleCanBeAdded = primaryCanBeAdded && applicatorCanBeAdded;
  const total =
    pricedPrimaryProduct && pricedApplicator
      ? formatAmount(
          getAmount(pricedPrimaryProduct) + getAmount(pricedApplicator),
          pricedPrimaryProduct,
        )
      : null;
  const missingSelection =
    primaryNeedsWeight && !selectedVariationId && applicatorNeedsVariation && !selectedApplicatorVariationId
      ? "Selecione o peso e o modelo"
      : primaryNeedsWeight && !selectedVariationId
        ? "Selecione o peso do rapé"
        : applicatorNeedsVariation && !selectedApplicatorVariationId
          ? "Selecione o modelo do aplicador"
          : null;
  const awaitingPrice = Boolean(
    (primaryNeedsWeight && selectedVariationId && !selectedVariation) ||
    (applicatorNeedsVariation && selectedApplicatorVariationId && !selectedApplicatorVariation),
  );

  const stageVariants = useMemo<Variants>(
    () => ({
      enter: (travelDirection: number) => ({
        opacity: 0,
        x: shouldReduceMotion ? 0 : travelDirection * 2.25 + "rem",
        filter: shouldReduceMotion ? "none" : "blur(3px)",
      }),
      center: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: {
          duration: shouldReduceMotion ? 0.18 : 0.38,
          ease: [0.16, 1, 0.3, 1],
        },
      },
      exit: (travelDirection: number) => ({
        opacity: 0,
        x: shouldReduceMotion ? 0 : travelDirection * -1.5 + "rem",
        filter: shouldReduceMotion ? "none" : "blur(2px)",
        transition: {
          duration: shouldReduceMotion ? 0.12 : 0.22,
          ease: [0.4, 0, 1, 1],
        },
      }),
    }),
    [shouldReduceMotion],
  );

  useEffect(() => {
    if (step !== "result" || !intention || !experience) {
      return;
    }

    const controller = new AbortController();

    const loadRecommendation = async () => {
      try {
        const query = new URLSearchParams({ intention, experience });
        const response = await fetch(`/api/ritual-recommendation/?${query}`, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(35_000)]),
        });
        const payload = (await response.json()) as RitualRecommendationResult & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Não foi possível preparar a recomendação.");
        }

        setRitualResult(payload);
        setResultState("ready");
      } catch {
        if (controller.signal.aborted) return;

        setResultState("error");
      }
    };

    void loadRecommendation();

    return () => controller.abort();
  }, [experience, intention, step]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let active = true;
    const images = Object.entries(MATCHER_LIVE_IMAGE_PATHS) as Array<
      [MatcherLiveImageKey, string]
    >;

    const refreshImage = async (key: MatcherLiveImageKey, imagePath: string) => {
      try {
        const response = await fetch(
          `/api/dev/asset-version/?path=${encodeURIComponent(imagePath)}`,
          { cache: "no-store" },
        );

        if (!response.ok) return;

        const data = (await response.json()) as { version?: string | null };
        if (!data.version || data.version === imageVersions.current[key]) return;

        const nextImage = `${imagePath}?v=${encodeURIComponent(data.version)}`;
        const preload = new window.Image();

        preload.onload = () => {
          if (!active) return;
          imageVersions.current[key] = data.version ?? "";
          setLiveImages((current) => ({ ...current, [key]: nextImage }));
        };
        preload.src = nextImage;
      } catch {
        // Mantém a última imagem válida enquanto o arquivo está sendo salvo.
      }
    };

    const refreshAllImages = () =>
      Promise.all(images.map(([key, imagePath]) => refreshImage(key, imagePath)));

    void refreshAllImages();
    const interval = window.setInterval(() => void refreshAllImages(), 750);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (step === "intro") return;

    const focusTimer = window.setTimeout(
      () => headingRef.current?.focus({ preventScroll: true }),
      shouldReduceMotion ? 50 : 420,
    );
    const frame = window.requestAnimationFrame(() => {
      const section = sectionRef.current;
      if (!section) return;

      const headerHeight =
        document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
      const sectionTop = section.getBoundingClientRect().top;

      if (sectionTop < headerHeight + 12) {
        window.scrollTo({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          top: window.scrollY + sectionTop - headerHeight - 16,
        });
      }

    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(focusTimer);
    };
  }, [shouldReduceMotion, step]);

  return (
    <section
      className={`matcher-section${step === "intro" ? " matcher-section-intro" : ""}`}
      aria-labelledby="matcher-title"
      id="descubra-seu-rape"
      ref={sectionRef}
      style={
        {
          "--matcher-section-image-desktop": `url("${liveImages.desktop}")`,
          "--matcher-section-image-mobile": `url("${liveImages.mobile}")`,
        } as CSSProperties
      }
    >
      <div className="container matcher-inner">
        {step !== "intro" ? (
          <>
          <p aria-live="polite" className="sr-only">
            {step === "intention"
              ? "Etapa 1 de 3: intenção"
              : step === "experience"
                ? "Etapa 2 de 3: experiência"
                : "Etapa 3 de 3: ritual recomendado"}
          </p>
          <ol aria-label="Progresso da jornada" className="matcher-progress">
            {progressSteps.map((item, index) => {
              const currentIndex = progressSteps.findIndex(({ id }) => id === step);
              return (
                <li
                  aria-current={item.id === step ? "step" : undefined}
                  className={index <= currentIndex ? "is-active" : undefined}
                  key={item.id}
                >
                  <span aria-hidden="true" className="matcher-progress-symbol">
                    <ProgressIcon icon={item.icon} />
                  </span>
                  {item.label}
                </li>
              );
            })}
          </ol>
          </>
        ) : null}

        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            animate="center"
            className="matcher-stage"
            custom={direction}
            exit="exit"
            initial="enter"
            key={step}
            variants={stageVariants}
          >
          {step === "intro" ? (
            <div className="matcher-intro">
              <h2 id="matcher-title">
                {introTitle ?? <>A Medicina ideal para sua <strong>intenção.</strong></>}
              </h2>
              <div className="matcher-intro-action">
                <div aria-hidden="true" className="matcher-intro-intention-slots">
                  {ritualIntentions.map((option) => (
                    <span
                      className="matcher-intro-intention-slot"
                      data-intention={option.id}
                      key={option.id}
                      style={
                        {
                          "--matcher-intention-image":
                            liveImages[option.id] === "none"
                              ? "none"
                              : `url("${liveImages[option.id]}")`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </div>
                <p>
                  Em 2 passos simples, descubra o rapé que melhor acompanha o seu
                  momento de consagração.
                </p>
                <button
                  className="button matcher-start-button"
                  onClick={() => goToStep("intention")}
                  type="button"
                >
                  Iniciar Jornada
                </button>
              </div>
            </div>
          ) : null}

          {step === "intention" ? (
            <div>
              <div className="matcher-heading">
                <h2 id="matcher-title" ref={headingRef} tabIndex={-1}>
                  O que você busca despertar hoje?
                </h2>
                <p>Escolha a intenção que mais se aproxima do seu momento.</p>
              </div>
              <div className="matcher-options matcher-intention-options">
                {ritualIntentions.map((option) => {
                  const cardStyle = {
                    "--matcher-card-image": `url("${option.image}")`,
                  } as CSSProperties;

                  return (
                    <button
                      className="matcher-intention-card"
                      key={option.id}
                      onClick={() => {
                        setIntention(option.id);
                        goToStep("experience");
                      }}
                      style={cardStyle}
                      type="button"
                    >
                      <span aria-hidden="true" className="matcher-card-frame" />
                      <span className="matcher-card-copy">
                        <span className="matcher-card-title">{option.label}</span>
                        <span className="matcher-card-description">
                          {option.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <span
                aria-hidden="true"
                className="scroll-hint matcher-options-scroll-hint"
              >
                Deslize para ver mais
              </span>
            </div>
          ) : null}

          {step === "experience" ? (
            <div className="matcher-experience">
              <div className="matcher-heading">
                <h2 id="matcher-title" ref={headingRef} tabIndex={-1}>
                  Qual a sua relação com a medicina?
                </h2>
                <p>Isso nos ajuda a indicar um perfil coerente com a sua prática.</p>
              </div>
              <div className="matcher-options matcher-experience-options">
                {ritualExperienceOptions.map((option) => (
                  <button
                    className="matcher-experience-card"
                    key={option.id}
                    onClick={() => {
                      setRitualResult(null);
                      setResultState("loading");
                      setSelectedVariationId(null);
                      setSelectedApplicatorVariationId(null);
                      setExperience(option.id);
                      goToStep("result");
                    }}
                    type="button"
                  >
                    <span aria-hidden="true" className="matcher-experience-icon">
                      {option.id === "beginner" ? "01" : "02"}
                    </span>
                    <span>
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                  </button>
                ))}
              </div>
              <span
                aria-hidden="true"
                className="scroll-hint matcher-options-scroll-hint"
              >
                Deslize para ver mais
              </span>
              <button
                className="matcher-back"
                onClick={() => goToStep("intention")}
                type="button"
              >
                Voltar e mudar a intenção
              </button>
            </div>
          ) : null}

          {step === "result" && recommendation ? (
            <div className="matcher-result">
              <div className="matcher-result-heading">
                <div>
                  <h2 id="matcher-title" ref={headingRef} tabIndex={-1}>
                    {recommendation.titulo}
                  </h2>
                </div>
                <p>{recommendation.descricao}</p>
              </div>

              <>
                  {(resultState === "loading" || resultState === "idle") ? (
                    <p className="matcher-cart-note" role="status">Atualizando pesos e disponibilidade…</p>
                  ) : resultState === "error" || (primaryNeedsWeight && !primaryVariations.length) ? (
                    <p className="matcher-cart-note" role="status">Selecione uma opção para confirmar preço e disponibilidade.</p>
                  ) : null}
                  <div className="ritual-bundle">
                    <FinderProduct
                      key={primaryProduct?.id ?? "primary"}
                      onVariationResolved={(variation) => setConfirmedVariations((current) => ({ ...current, [variation.id]: variation }))}
                      suggestedSlug={!ritualResult ? recommendation.produtoPrincipal.candidatos[0].slug : undefined}
                      detail={primaryRecommendation
                        ? `${primaryRecommendation.perfil} ${recommendation.produtoPrincipal.dosagemSugerida}`
                        : !ritualResult ? recommendation.produtoPrincipal.candidatos[0].perfil
                          : "No momento, não encontramos um rapé disponível para esta intenção."}
                      kind="Medicina principal"
                      onVariationChange={setSelectedVariationId}
                      product={primaryProduct}
                      selectionLabel="Escolha o peso"
                      selectedVariationId={selectedVariationId}
                      variations={primaryVariations}
                    />
                    <span aria-hidden="true" className="ritual-bundle-plus">+</span>
                    <FinderProduct
                      key={applicator?.id ?? "applicator"}
                      onVariationResolved={(variation) => setConfirmedVariations((current) => ({ ...current, [variation.id]: variation }))}
                      suggestedSlug={!ritualResult ? recommendation.aplicador.slug : undefined}
                      detail={recommendation.aplicador.motivo}
                      kind="Aplicador sugerido"
                      onVariationChange={setSelectedApplicatorVariationId}
                      product={applicator}
                      selectedVariationId={selectedApplicatorVariationId}
                      selectionLabel="Escolha o modelo"
                      variations={applicatorVariations}
                    />
                  </div>

                  <div className="matcher-result-actions">
                    <div aria-live="polite" className="matcher-total">
                      <span>Total estimado do ritual</span>
                      <strong>
                        {total ?? (awaitingPrice ? "Preço ainda não confirmado" : missingSelection) ?? "Consulte os produtos"}
                      </strong>
                    </div>
                    <div className="matcher-action-buttons">
                      <button
                        aria-describedby="ritual-cart-note"
                        className="button matcher-bundle-button"
                        disabled={cartBusy || cartLoading || !bundleCanBeAdded}
                        onClick={async () => {
                          if (!pricedPrimaryProduct || !pricedApplicator || !bundleCanBeAdded) return;
                          if (await mutate({ action: "add", id: pricedPrimaryProduct.id, quantity: 1 })) {
                            await mutate({ action: "add", id: pricedApplicator.id, quantity: 1 });
                          }
                        }}
                        type="button"
                      >
                        {cartBusy ? "Adicionando à sacola…" : "Adicionar Ritual Completo ao Carrinho"}
                      </button>
                      {primaryProduct ? (
                        <button
                          className="button matcher-product-button"
                          disabled={cartBusy || cartLoading || !primaryCanBeAdded}
                          onClick={() => {
                            if (pricedPrimaryProduct && primaryCanBeAdded) {
                              void mutate({ action: "add", id: pricedPrimaryProduct.id, quantity: 1 });
                            }
                          }}
                          type="button"
                        >
                          Comprar apenas o rapé
                        </button>
                      ) : null}
                    </div>
                    <p className="matcher-cart-note" id="ritual-cart-note">
                      {awaitingPrice
                        ? "Sua escolha foi mantida. Tente confirmar novamente no peso ou modelo selecionado."
                        : missingSelection
                        ? `${missingSelection} para continuar.`
                        : "O ritual completo adiciona o rapé escolhido e o aplicador à sacola."}
                    </p>
                    {cartError ? <>
                      <p className="matcher-cart-error" role="alert">{cartError}</p>
                      <button className="matcher-reset" disabled={cartBusy || cartLoading} onClick={() => void refreshCart()} type="button">
                        {cartLoading ? "Reconectando à sacola…" : "Tentar reconectar à sacola"}
                      </button>
                    </> : null}
                    <button className="matcher-reset" onClick={reset} type="button">
                      Refazer escolha
                    </button>
                  </div>

                  <p className="matcher-care-note">
                    Esta curadoria é informativa e não substitui a orientação do produtor
                    ou de um profissional de saúde. O rapé contém tabaco e nicotina.
                  </p>
              </>
            </div>
          ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

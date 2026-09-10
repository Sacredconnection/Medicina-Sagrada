"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { plainText } from "@/lib/html";
import {
  ritualExperienceOptions,
  ritualIntentions,
  ritualsData,
  type RitualExperienceId,
  type RitualIntentionId,
  type RitualKey,
} from "@/lib/rituals-data";
import type { WooProduct } from "@/lib/types";

type FinderStep = "intro" | "intention" | "experience" | "result";

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

const productHref = (product: WooProduct) => `/product/${product.slug}/`;

const getAmount = (product: WooProduct) => {
  const rawAmount = product.prices.price_range?.min_amount ?? product.prices.price;
  return Number(rawAmount) / 10 ** product.prices.currency_minor_unit;
};

const formatAmount = (amount: number, product: WooProduct) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: product.prices.currency_code,
  }).format(amount);

function FinderProduct({
  kind,
  product,
  detail,
}: {
  kind: string;
  product: WooProduct | undefined;
  detail: string;
}) {
  if (!product) {
    return (
      <article className="ritual-product ritual-product-unavailable">
        <h3>Produto temporariamente indisponível</h3>
        <p className="ritual-product-kind">{kind}</p>
        <p>{detail}</p>
      </article>
    );
  }

  const image = product.images[0];

  return (
    <article className="ritual-product">
      <Link
        aria-hidden="true"
        className="ritual-product-image"
        href={productHref(product)}
        tabIndex={-1}
      >
        {image ? (
          <Image
            alt={image.alt || plainText(product.name)}
            fill
            sizes="(max-width: 700px) 35vw, 11rem"
            src={image.thumbnail || image.src}
          />
        ) : (
          <span>Imagem indisponível</span>
        )}
      </Link>
      <div className="ritual-product-copy">
        <h3>
          <Link href={productHref(product)}>{plainText(product.name)}</Link>
        </h3>
        <p className="ritual-product-kind">{kind}</p>
        <p>{detail}</p>
        <div className="ritual-product-footer">
          <strong>{formatAmount(getAmount(product), product)}</strong>
          <Link href={productHref(product)}>Ver produto</Link>
        </div>
      </div>
    </article>
  );
}

export function ProductMatcher({ products }: { products: WooProduct[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<FinderStep>("intro");
  const [intention, setIntention] = useState<RitualIntentionId | null>(null);
  const [experience, setExperience] = useState<RitualExperienceId | null>(null);

  const recommendation = useMemo(() => {
    if (!intention || !experience) return null;
    return ritualsData[`${intention}:${experience}` as RitualKey];
  }, [experience, intention]);

  const primaryProduct = useMemo(() => {
    if (!recommendation) return undefined;
    return products.find(({ slug }) => slug === recommendation.produtoPrincipal.slug);
  }, [products, recommendation]);

  const applicator = useMemo(() => {
    if (!recommendation) return undefined;
    return products.find(({ slug }) => slug === recommendation.aplicador.slug);
  }, [products, recommendation]);

  const reset = () => {
    setIntention(null);
    setExperience(null);
    setStep("intention");
  };

  const total =
    primaryProduct && applicator
      ? formatAmount(getAmount(primaryProduct) + getAmount(applicator), primaryProduct)
      : null;

  useEffect(() => {
    if (step === "intro") return;

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

      headingRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [step]);

  return (
    <section
      className="matcher-section"
      aria-labelledby="matcher-title"
      id="descubra-seu-rape"
      ref={sectionRef}
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

        <div className="matcher-stage" key={step}>
          {step === "intro" ? (
            <div className="matcher-intro">
              <div className="matcher-intro-copy">
                <h2 id="matcher-title">Descubra sua Medicina de Hoje</h2>
                <p>
                  Em 2 passos simples, encontre o rapé ideal para o seu momento e
                  intenção de consagração.
                </p>
                <button
                  className="button matcher-start-button"
                  onClick={() => setStep("intention")}
                  type="button"
                >
                  Iniciar Jornada
                </button>
              </div>
              <div aria-hidden="true" className="matcher-intro-visual" />
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
                        setStep("experience");
                      }}
                      style={cardStyle}
                      type="button"
                    >
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
                      setExperience(option.id);
                      setStep("result");
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
              <button
                className="matcher-back"
                onClick={() => setStep("intention")}
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

              <div className="ritual-bundle">
                <FinderProduct
                  detail={`${recommendation.produtoPrincipal.perfilAromatico} ${recommendation.produtoPrincipal.dosagemSugerida}`}
                  kind="Medicina principal"
                  product={primaryProduct}
                />
                <span aria-hidden="true" className="ritual-bundle-plus">+</span>
                <FinderProduct
                  detail={recommendation.aplicador.motivo}
                  kind="Aplicador sugerido"
                  product={applicator}
                />
              </div>

              <div className="matcher-result-actions">
                <div className="matcher-total">
                  <span>Total estimado do ritual</span>
                  <strong>{total ? `A partir de ${total}` : "Consulte os produtos"}</strong>
                </div>
                <div className="matcher-action-buttons">
                  <button
                    aria-describedby="ritual-cart-note"
                    className="button matcher-bundle-button"
                    disabled
                    type="button"
                  >
                    Adicionar Ritual Completo ao Carrinho
                  </button>
                  {primaryProduct ? (
                    <Link className="button matcher-product-button" href={productHref(primaryProduct)}>
                      Comprar apenas o rapé
                    </Link>
                  ) : null}
                </div>
                <p className="matcher-cart-note" id="ritual-cart-note">
                  O carrinho conjunto será ativado quando a integração de kits estiver disponível.
                </p>
                <button className="matcher-reset" onClick={reset} type="button">
                  Refazer escolha
                </button>
              </div>

              <p className="matcher-care-note">
                Esta curadoria é informativa e não substitui a orientação do produtor
                ou de um profissional de saúde. O rapé contém tabaco e nicotina.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

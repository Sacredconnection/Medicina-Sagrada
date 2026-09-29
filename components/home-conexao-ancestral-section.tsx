"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";

const assetBase = "/assets/home/conexao-ancestral";

const pillars = [
  {
    icon: "shield",
    title: "Autodeterminação",
    description:
      "Fortalecimento das lideranças indígenas e da gestão autônoma de seus territórios.",
  },
  {
    icon: "leaf",
    title: "Preservação cultural",
    description:
      "Proteção dos cantos tradicionais, das medicinas da floresta e das linhagens sagradas.",
  },
  {
    icon: "water",
    title: "Projetos de impacto",
    description:
      "Ações concretas de acesso à água potável, sustentabilidade e infraestrutura básica.",
  },
] as const;

const gallery = [
  {
    src: `${assetBase}/conexao-ancestral-collage-1.webp`,
    alt: "Comunidade reunida em meio à floresta amazônica",
  },
  {
    src: `${assetBase}/conexao-ancestral-collage-2.webp`,
    alt: "Expressão da cultura indígena amazônica",
  },
  {
    src: `${assetBase}/conexao-ancestral-collage-3.webp`,
    alt: "Vista aérea de uma comunidade cercada pela floresta",
  },
  {
    src: `${assetBase}/conexao-ancestral-collage-4.webp`,
    alt: "Morador atravessando um curso de água na floresta",
  },
] as const;

function PillarIcon({ name }: { name: (typeof pillars)[number]["icon"] }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {name === "shield" ? (
        <path d="M12 3 5.5 5.6v5.8c0 4.2 2.6 7.5 6.5 9.6 3.9-2.1 6.5-5.4 6.5-9.6V5.6L12 3Z" />
      ) : name === "leaf" ? (
        <>
          <path d="M19.5 4.5C12.4 4.7 7.2 7.7 6 13.2c-.6 2.8 1.4 5.5 4.2 5.3 5.5-.4 8.5-5.5 9.3-14Z" />
          <path d="M4.5 20c2.2-4.2 5.4-7.2 10.2-9.6" />
        </>
      ) : (
        <path d="M12 3.5c-2.7 4-6 7.3-6 11a6 6 0 0 0 12 0c0-3.7-3.3-7-6-11Z" />
      )}
    </svg>
  );
}

const copyVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const galleryVariants: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.2, staggerChildren: 0.09 },
  },
};

const photoVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

export function HomeConexaoAncestralSection() {
  const reduceMotion = useReducedMotion();
  const motionState = reduceMotion ? false : "hidden";

  return (
    <section
      className="ancestral-section"
      aria-labelledby="conexao-ancestral-title"
      id="conexao-ancestral"
    >
      <div className="container">
        <div className="ancestral-card">
          <Image
            alt=""
            aria-hidden="true"
            className="ancestral-watermark"
            height={750}
            src={`${assetBase}/conexao-ancestral-simbolo.svg`}
            width={750}
          />

          <div className="ancestral-layout">
            <motion.div
              className="ancestral-copy"
              initial={motionState}
              variants={copyVariants}
              viewport={{ once: true, amount: 0.15 }}
              whileInView="visible"
            >
              <Image
                alt="Conexão Ancestral — Povos da Floresta"
                className="ancestral-logo"
                height={160}
                src={`${assetBase}/conexao-ancestral-logo.svg`}
                width={400}
              />

              <div className="ancestral-introduction">
                <h2 id="conexao-ancestral-title">
                  Pontes de apoio para a <span>Floresta Amazônica</span>
                </h2>
                <p>
                  A Conexão Ancestral atua como uma ponte vital entre a sabedoria da
                  floresta e o mundo moderno. Apoiamos a autodeterminação indígena no
                  Acre, protegendo conhecimentos ancestrais e territórios tradicionais.
                </p>
              </div>

              <div className="ancestral-pillars">
                {pillars.map((pillar) => (
                  <article className="ancestral-pillar" key={pillar.title}>
                    <span className="ancestral-pillar-icon">
                      <PillarIcon name={pillar.icon} />
                    </span>
                    <div>
                      <h3>{pillar.title}</h3>
                      <p>{pillar.description}</p>
                    </div>
                  </article>
                ))}
              </div>

              <a
                className="button ancestral-cta"
                href="https://www.conexaoancestral.org/"
                rel="noopener noreferrer"
                target="_blank"
              >
                CONHEÇA OS PROJETOS
              </a>
            </motion.div>

            <motion.div
              className="ancestral-gallery"
              initial={motionState}
              variants={galleryVariants}
              viewport={{ once: true, amount: 0.15 }}
              whileInView="visible"
            >
              <motion.figure className="ancestral-photo ancestral-photo-featured" variants={photoVariants}>
                <Image
                  alt="Família indígena reunida na floresta amazônica"
                  fill
                  sizes="(min-width: 1000px) 34vw, (min-width: 600px) 80vw, 100vw"
                  src={`${assetBase}/conexao-ancestral-collage-5.webp`}
                />
              </motion.figure>

              <div className="ancestral-photo-grid">
                {gallery.map((photo) => (
                  <motion.figure className="ancestral-photo" key={photo.src} variants={photoVariants}>
                    <Image
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1000px) 17vw, (min-width: 600px) 40vw, 46vw"
                      src={photo.src}
                    />
                  </motion.figure>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

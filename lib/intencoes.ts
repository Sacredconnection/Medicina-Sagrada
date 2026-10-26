export const intentions = [
  {
    slug: "aterramento-e-presenca",
    name: "Aterramento e presença",
    meaning: "Enraizamento, estabilidade, equilíbrio e atenção ao corpo.",
  },
  {
    slug: "foco-e-clareza",
    name: "Foco e clareza",
    meaning: "Concentração, atenção, lucidez e organização mental.",
  },
  {
    slug: "calma-e-introspeccao",
    name: "Calma e introspecção",
    meaning: "Quietude, reflexão, meditação e atenção voltada para dentro.",
  },
  {
    slug: "energia-e-renovacao",
    name: "Energia e renovação",
    meaning: "Ânimo, vitalidade, coragem e novos ciclos.",
  },
  {
    slug: "limpeza-e-refrescancia",
    name: "Limpeza e refrescância",
    meaning: "Aromas, frescor, leveza e recomeço.",
  },
  {
    slug: "oracao-e-cerimonia",
    name: "Oração e cerimônia",
    meaning: "Oração, ritual e prática espiritual.",
  },
  {
    slug: "coracao-e-conexao",
    name: "Coração e conexão",
    meaning: "Afeto, acolhimento, compaixão e conexão com outras pessoas.",
  },
] as const;

export type Intention = (typeof intentions)[number];

export function getIntention(slug: string) {
  return intentions.find((intention) => intention.slug === slug);
}

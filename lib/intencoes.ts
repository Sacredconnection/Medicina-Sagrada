export const intentions = [
  {
    slug: "aterramento-e-presenca",
    name: "Aterramento e presença",
    meaning: "Descrições que evocam enraizamento, estabilidade, equilíbrio e atenção ao corpo.",
    character: "A classificação reúne linguagem editorial sobre presença corporal e sensação de firmeza encontrada nas descrições consultadas.",
  },
  {
    slug: "foco-e-clareza",
    name: "Foco e clareza",
    meaning: "Descrições que destacam concentração, atenção, lucidez e organização mental.",
    character: "O tema organiza referências a atenção e clareza presentes nos textos de origem. Não indica efeito garantido.",
  },
  {
    slug: "calma-e-introspeccao",
    name: "Calma e introspecção",
    meaning: "Descrições associadas a quietude, reflexão, meditação ou atenção voltada para dentro.",
    character: "A classificação resume o tom contemplativo atribuído ao preparo em sua descrição editorial.",
  },
  {
    slug: "energia-e-renovacao",
    name: "Energia e renovação",
    meaning: "Descrições que evocam ânimo, vitalidade, coragem ou movimento em direção a um novo ciclo.",
    character: "O tema reúne linguagem de renovação e disposição, sem afirmar resultados físicos ou emocionais.",
  },
  {
    slug: "limpeza-e-refrescancia",
    name: "Limpeza e refrescância",
    meaning: "Descrições que mencionam aromas, sensação de frescor, leveza ou recomeço.",
    character: "A classificação acompanha a linguagem sensorial e simbólica usada nas descrições consultadas.",
  },
  {
    slug: "oracao-e-cerimonia",
    name: "Oração e cerimônia",
    meaning: "Descrições que situam o preparo em oração, ritual, prática espiritual ou trabalho intencional.",
    character: "O tema se refere ao contexto cultural ou cerimonial descrito, sem substituir a orientação de seus detentores de conhecimento.",
  },
  {
    slug: "coracao-e-conexao",
    name: "Coração e conexão",
    meaning: "Descrições que evocam afeto, acolhimento, compaixão ou vínculo com outras pessoas.",
    character: "A classificação resume referências relacionais e afetivas da descrição editorial, sem prometer efeitos.",
  },
] as const;

export type Intention = (typeof intentions)[number];

export function getIntention(slug: string) {
  return intentions.find((intention) => intention.slug === slug);
}

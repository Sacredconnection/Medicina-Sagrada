export const intentions = [
  {
    slug: "aterramento-e-presenca",
    name: "Aterramento e presença",
    cardTitle: "Aterramento\ne presença",
    meaning: "Para voltar ao corpo\ne ao momento presente.",
  },
  {
    slug: "forca-e-coragem",
    name: "Força e coragem",
    cardTitle: "Força e\ncoragem",
    meaning: "Para cultivar firmeza\ne seguir com coragem.",
  },
  {
    slug: "foco-e-clareza",
    name: "Foco e clareza",
    cardTitle: "Foco e\nclareza",
    meaning: "Para reunir a atenção\ne organizar as ideias.",
  },
  {
    slug: "calma-e-introspeccao",
    name: "Calma e introspecção",
    cardTitle: "Calma e\nintrospecção",
    meaning: "Para desacelerar o ritmo\ne encontrar quietude.",
  },
  {
    slug: "energia-e-renovacao",
    name: "Energia e renovação",
    cardTitle: "Energia e\nrenovação",
    meaning: "Para renovar o ânimo\ne iniciar novos ciclos.",
  },
  {
    slug: "limpeza-e-refrescancia",
    name: "Limpeza e refrescância",
    cardTitle: "Limpeza e\nrefrescância",
    meaning: "Para marcar um recomeço\ncom leveza e frescor.",
  },
  {
    slug: "oracao-e-cerimonia",
    name: "Oração e cerimônia",
    cardTitle: "Oração e\ncerimônia",
    meaning: "Para acompanhar a oração\ne a prática espiritual.",
  },
  {
    slug: "coracao-e-conexao",
    name: "Coração e conexão",
    cardTitle: "Coração e\nconexão",
    meaning: "Para acolher o afeto\ne cultivar a conexão.",
  },
] as const;

export type Intention = (typeof intentions)[number];

// Assets do índice. Os três arquivos temporários podem ser substituídos sem mudar código.
export const intentionCardImages: Record<Intention["slug"], string> = {
  "aterramento-e-presenca": "/assets/intentions/aterramento-e-presenca.webp",
  "forca-e-coragem": "/assets/intentions/forca-e-coragem.webp",
  "foco-e-clareza": "/assets/intentions/foco-e-clareza.webp",
  "calma-e-introspeccao": "/assets/intentions/calma-e-introspeccao.webp",
  "energia-e-renovacao": "/assets/intentions/energia-e-renovacao.webp",
  "limpeza-e-refrescancia": "/assets/intentions/limpeza-e-refrescancia.webp",
  "oracao-e-cerimonia": "/assets/intentions/oracao-e-cerimonia.webp",
  "coracao-e-conexao": "/assets/intentions/coracao-e-conexao.webp",
};

export function getIntention(slug: string) {
  return intentions.find((intention) => intention.slug === slug);
}

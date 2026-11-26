export const intentions = [
  {
    slug: "aterramento-e-presenca",
    headerImagePosition: "50% 26%",
    name: "Aterramento e presença",
    cardTitle: "Aterramento\ne presença",
    meaning: "Para voltar ao corpo\ne ao momento presente.",
  },
  {
    slug: "forca-e-coragem",
    headerImagePosition: "50% 25%",
    name: "Força e coragem",
    cardTitle: "Força e\ncoragem",
    meaning: "Para cultivar firmeza\ne seguir com coragem.",
  },
  {
    slug: "foco-e-clareza",
    headerImagePosition: "62% 23%",
    name: "Foco e clareza",
    cardTitle: "Foco e\nclareza",
    meaning: "Para reunir a atenção\ne organizar as ideias.",
  },
  {
    slug: "calma-e-introspeccao",
    headerImagePosition: "50% 8%",
    name: "Calma e introspecção",
    cardTitle: "Calma e\nintrospecção",
    meaning: "Para desacelerar o ritmo\ne encontrar quietude.",
  },
  {
    slug: "energia-e-renovacao",
    headerImagePosition: "62% 43%",
    name: "Energia e renovação",
    cardTitle: "Energia e\nrenovação",
    meaning: "Para renovar o ânimo\ne iniciar novos ciclos.",
  },
  {
    slug: "limpeza-e-refrescancia",
    headerImagePosition: "54% 39%",
    name: "Limpeza e refrescância",
    cardTitle: "Limpeza e\nrefrescância",
    meaning: "Para marcar um recomeço\ncom leveza e frescor.",
  },
  {
    slug: "oracao-e-cerimonia",
    headerImagePosition: "57% 41%",
    name: "Oração e cerimônia",
    cardTitle: "Oração e\ncerimônia",
    meaning: "Para acompanhar a oração\ne a prática espiritual.",
  },
  {
    slug: "coracao-e-conexao",
    headerImagePosition: "64% 20%",
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

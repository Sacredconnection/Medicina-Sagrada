export type RitualIntentionId =
  | "grounding"
  | "strength"
  | "serenity"
  | "heart"
  | "purification";

export type RitualExperienceId = "beginner" | "practitioner";

export type RitualKey = `${RitualIntentionId}:${RitualExperienceId}`;

export type RitualRecommendation = {
  titulo: string;
  descricao: string;
  produtoPrincipal: {
    slug: string;
    perfilAromatico: string;
    dosagemSugerida: string;
  };
  aplicador: {
    slug: string;
    motivo: string;
  };
  preco: "soma-dos-produtos-ao-vivo";
};

export const ritualIntentions = [
  {
    id: "grounding",
    label: "Aterramento & Presença",
    description: "Para voltar ao corpo, ao ritmo e ao momento presente.",
    image: "/assets/home/matcher/aterramento-presenca.webp",
  },
  {
    id: "strength",
    label: "Força &\nCoragem",
    description: "Para sustentar firmeza, disposição e movimento.",
    image: "/assets/home/matcher/forca-coragem.webp",
  },
  {
    id: "serenity",
    label: "Silêncio Mental & Paz",
    description: "Para desacelerar e criar espaço para a quietude.",
    image: "/assets/home/matcher/silencio-mental-paz.webp",
  },
  {
    id: "heart",
    label: "Abertura do Coração",
    description: "Para acolher afeto, presença e conexão.",
    image: "/assets/home/matcher/abertura-coracao.webp",
  },
  {
    id: "purification",
    label: "Purificação & Limpeza",
    description: "Para renovar o ambiente e marcar um novo começo.",
    image: "/assets/home/matcher/purificacao-limpeza.webp",
  },
] as const satisfies ReadonlyArray<{
  id: RitualIntentionId;
  label: string;
  description: string;
  image: string;
}>;

export const ritualExperienceOptions = [
  {
    id: "beginner",
    label: "Iniciante",
    description: "Primeira experiência ou busco medicinas suaves e acolhedoras.",
  },
  {
    id: "practitioner",
    label: "Já pratico",
    description: "Familiarizado com aplicações profundas e medicinas de força.",
  },
] as const satisfies ReadonlyArray<{
  id: RitualExperienceId;
  label: string;
  description: string;
}>;

const beginnerApplicator = {
  slug: "kuripe-bambu-senna",
  motivo: "Formato simples e direto para acompanhar os primeiros rituais.",
};

const practitionerApplicator = {
  slug: "kuripe-de-madeira-nobre-ajustavel",
  motivo: "Aplicador ajustável para quem já conhece o próprio modo de uso.",
};

const beginnerDose =
  "Comece pela menor porção indicada pelo produtor e observe sua resposta com calma.";
const practitionerDose =
  "Use a menor porção compatível com sua prática; intensidade não substitui presença.";

export const ritualsData: Record<RitualKey, RitualRecommendation> = {
  "grounding:beginner": {
    titulo: "Ritual de Aterramento & Presença",
    descricao:
      "Uma combinação de perfil tradicional para criar pausa, escuta e contato com o presente.",
    produtoPrincipal: {
      slug: "rape-huni-kuin-tradicao",
      perfilAromatico: "Herbal, resinoso e suavemente amadeirado.",
      dosagemSugerida: beginnerDose,
    },
    aplicador: beginnerApplicator,
    preco: "soma-dos-produtos-ao-vivo",
  },
  "grounding:practitioner": {
    titulo: "Ritual de Aterramento & Firmeza",
    descricao:
      "Uma escolha de presença densa e estrutura para práticas já estabelecidas.",
    produtoPrincipal: {
      slug: "rape-yawanawa-cacique",
      perfilAromatico: "Tabaco e Tsunu, com presença seca e marcante.",
      dosagemSugerida: practitionerDose,
    },
    aplicador: practitionerApplicator,
    preco: "soma-dos-produtos-ao-vivo",
  },
  "strength:beginner": {
    titulo: "Ritual de Força Serena",
    descricao:
      "Um perfil clássico para apoiar intenção, firmeza e movimento sem excesso.",
    produtoPrincipal: {
      slug: "rape-xamanico-tsunu-forca",
      perfilAromatico: "Tabaco e Tsunu, terroso e direto.",
      dosagemSugerida: beginnerDose,
    },
    aplicador: beginnerApplicator,
    preco: "soma-dos-produtos-ao-vivo",
  },
  "strength:practitioner": {
    titulo: "Ritual de Força & Direção",
    descricao:
      "Uma combinação de caráter intenso para quem já cultiva uma prática consciente.",
    produtoPrincipal: {
      slug: "rape-yawanawa-cacique",
      perfilAromatico: "Tabaco e Tsunu, denso e persistente.",
      dosagemSugerida: practitionerDose,
    },
    aplicador: practitionerApplicator,
    preco: "soma-dos-produtos-ao-vivo",
  },
  "serenity:beginner": {
    titulo: "Ritual de Silêncio & Acolhimento",
    descricao:
      "Uma escolha aromática para desacelerar o ritmo e preparar um momento de quietude.",
    produtoPrincipal: {
      slug: "rape-shawadawa-relax",
      perfilAromatico: "Tsunu e Catinga-de-mulata, herbal e delicado.",
      dosagemSugerida: beginnerDose,
    },
    aplicador: beginnerApplicator,
    preco: "soma-dos-produtos-ao-vivo",
  },
  "serenity:practitioner": {
    titulo: "Ritual de Silêncio & Clareza",
    descricao:
      "Um perfil floral para práticas de recolhimento, organização e escuta interior.",
    produtoPrincipal: {
      slug: "rape-kuntanawa-flor-de-samauma",
      perfilAromatico: "Floral, perfumado e equilibrado.",
      dosagemSugerida: practitionerDose,
    },
    aplicador: practitionerApplicator,
    preco: "soma-dos-produtos-ao-vivo",
  },
  "heart:beginner": {
    titulo: "Ritual de Abertura & Suavidade",
    descricao:
      "Uma escolha floral e acolhedora para conduzir a prática com delicadeza.",
    produtoPrincipal: {
      slug: "rape-caboclo-flor-de-jaci",
      perfilAromatico: "Floral, suave e envolvente.",
      dosagemSugerida: beginnerDose,
    },
    aplicador: beginnerApplicator,
    preco: "soma-dos-produtos-ao-vivo",
  },
  "heart:practitioner": {
    titulo: "Ritual de Coração & Harmonia",
    descricao:
      "Uma combinação floral para práticas de presença, vínculo e harmonização.",
    produtoPrincipal: {
      slug: "rape-kuntanawa-flor-de-samauma",
      perfilAromatico: "Flores de Samaúma, perfumado e expressivo.",
      dosagemSugerida: practitionerDose,
    },
    aplicador: practitionerApplicator,
    preco: "soma-dos-produtos-ao-vivo",
  },
  "purification:beginner": {
    titulo: "Ritual de Renovação & Frescor",
    descricao:
      "Uma escolha fresca para marcar transições e renovar a atenção com leveza.",
    produtoPrincipal: {
      slug: "rape-nukini-fresh-eucalipto",
      perfilAromatico: "Eucalipto, fresco e herbal.",
      dosagemSugerida: beginnerDose,
    },
    aplicador: beginnerApplicator,
    preco: "soma-dos-produtos-ao-vivo",
  },
  "purification:practitioner": {
    titulo: "Ritual de Purificação & Clareza",
    descricao:
      "Um perfil mentolado e marcante para uma prática de renovação já amadurecida.",
    produtoPrincipal: {
      slug: "rape-nukini-limpeza-astral",
      perfilAromatico: "Mentolado, herbal e intenso.",
      dosagemSugerida: practitionerDose,
    },
    aplicador: practitionerApplicator,
    preco: "soma-dos-produtos-ao-vivo",
  },
};

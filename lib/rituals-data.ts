export type RitualIntentionId =
  | "grounding"
  | "strength"
  | "serenity"
  | "heart"
  | "purification";

export type RitualExperienceId = "beginner" | "practitioner";

export type RitualKey = `${RitualIntentionId}:${RitualExperienceId}`;

export type RitualProductCandidate = {
  slug: string;
  perfil: string;
};

export type RitualRecommendation = {
  titulo: string;
  descricao: string;
  produtoPrincipal: {
    candidatos: readonly [RitualProductCandidate, ...RitualProductCandidate[]];
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
      candidatos: [
        {
          slug: "huni-kuin-murici",
          perfil: "Murici e tabaco de corda, agradável e levemente adocicado.",
        },
        {
          slug: "rape-huni-kuin-tradicao",
          perfil: "Paricá, tabaco nativo e ervas tradicionais, com perfil terroso.",
        },
      ],
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
      candidatos: [
        {
          slug: "rape-xamanico-parica",
          perfil: "Paricá e tabaco Sabiá, forte, terroso e de aterramento profundo.",
        },
        {
          slug: "shawadawa-rupusuti",
          perfil: "Tsunu, Sabiá e Rupusuti, quente e voltado à presença no corpo.",
        },
        {
          slug: "huni-kuin-cacau",
          perfil: "Cacau, Mói e Sabiá, de caráter terroso e forte.",
        },
      ],
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
      candidatos: [
        {
          slug: "rape-xamanico-tsunu-forca",
          perfil: "Tsunu e tabaco de força média, simples e direto.",
        },
        {
          slug: "huni-kuin-murici",
          perfil: "Murici e tabaco de corda, agradável e ligado à disposição cotidiana.",
        },
        {
          slug: "yawanawa-esperanza",
          perfil: "Tsunu e tabaco de corda, com perfil de firmeza e concentração.",
        },
      ],
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
      candidatos: [
        {
          slug: "rape-xamanico-tsunu-extra",
          perfil: "Tsunu e tabaco Sabiá, extra forte e de presença marcante.",
        },
        {
          slug: "caboclo-parica",
          perfil: "Paricá e tabaco de corda forte, profundo, vigoroso e aterrador.",
        },
        {
          slug: "rape-xamanico-parica",
          perfil: "Paricá e tabaco Sabiá, forte e voltado à firmeza.",
        },
      ],
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
      candidatos: [
        {
          slug: "rape-shawadawa-relax",
          perfil: "Tsunu e Catinga-de-mulata, herbal e tranquilizante.",
        },
        {
          slug: "rape-nukini-gelsinho",
          perfil: "Refrescante, harmonioso e indicado no catálogo para uso cotidiano.",
        },
        {
          slug: "caboclo-rosas-brancas",
          perfil: "Rosas-brancas e Tsunu, perfumado, calmante e acolhedor.",
        },
      ],
      dosagemSugerida: beginnerDose,
    },
    aplicador: beginnerApplicator,
    preco: "soma-dos-produtos-ao-vivo",
  },
  "serenity:practitioner": {
    titulo: "Ritual de Silêncio & Clareza",
    descricao:
      "Um perfil de calma e firmeza para práticas de recolhimento, organização e escuta interior.",
    produtoPrincipal: {
      candidatos: [
        {
          slug: "rape-kuntanawa-tete-pawa",
          perfil: "Kawa Xinã e Kumã, com calma, tranquilidade e firmeza.",
        },
        {
          slug: "yawanawa-mulateiro",
          perfil: "Mulateiro e tabaco de corda, voltado ao relaxamento e à concentração.",
        },
        {
          slug: "rape-xamanico-dourado",
          perfil: "Pixuri, eucalipto e caneleiro, fresco e ligado à quietude mental.",
        },
      ],
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
      candidatos: [
        {
          slug: "caboclo-rosas-brancas",
          perfil: "Rosas-brancas e Tsunu, perfumado, calmante e acolhedor para o coração.",
        },
        {
          slug: "huni-kuin-murici",
          perfil: "Murici e tabaco de corda, agradável e associado ao equilíbrio com o ambiente.",
        },
      ],
      dosagemSugerida: beginnerDose,
    },
    aplicador: beginnerApplicator,
    preco: "soma-dos-produtos-ao-vivo",
  },
  "heart:practitioner": {
    titulo: "Ritual de Coração & Harmonia",
    descricao:
      "Uma combinação de ervas ligada à compaixão, ao vínculo e à presença do coração.",
    produtoPrincipal: {
      candidatos: [
        {
          slug: "rape-xamanico-espiritual",
          perfil: "Bobinsana e Cumaru Trevo, perfumado e ligado à compaixão.",
        },
        {
          slug: "rape-xamanico-haux-haux",
          perfil: "Veia de Pajé, cipó-cravo e Tsunu, intenso e associado ao coração.",
        },
        {
          slug: "huni-kuin-cacau",
          perfil: "Cacau, Mói e Sabiá, forte, terroso e associado ao coração.",
        },
      ],
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
      candidatos: [
        {
          slug: "rape-huni-kuin-capemba",
          perfil: "Capemba e Sabiá, com perfil suave de limpeza e renovação.",
        },
        {
          slug: "rape-nukini-rawni",
          perfil: "Rawni, sutil e gentil, associado à limpeza espiritual.",
        },
        {
          slug: "rape-xamanico-sem-tabaco-menta",
          perfil: "Menta sem tabaco, fresca e voltada à renovação.",
        },
      ],
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
      candidatos: [
        {
          slug: "rape-nukini-limpeza-astral",
          perfil: "Lourinho, Sanu e Sabiá, mentolado, equilibrado e marcante.",
        },
        {
          slug: "puyanawa-pixuri",
          perfil: "Pixuri, Murici e Mói, herbal e tradicionalmente ligado à limpeza.",
        },
        {
          slug: "rape-xamanico-dourado",
          perfil: "Pixuri, eucalipto e caneleiro, refrescante e de presença intensa.",
        },
      ],
      dosagemSugerida: practitionerDose,
    },
    aplicador: practitionerApplicator,
    preco: "soma-dos-produtos-ao-vivo",
  },
};

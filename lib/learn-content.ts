export type LearnGuide = {
  slug: string;
  label: string;
  title: string;
  summary: string;
  introduction: string;
  imageFolder: string;
  sections: { title: string; body: string; image: string; alt: string }[];
  checklist: string[];
  collection: "rape" | "aplicadores" | "incensos";
  collectionTitle: string;
  collectionCopy: string;
};

export const learnGuides: LearnGuide[] = [
  {
    slug: "primeiro-rape", label: "Seu primeiro rapé", title: "Comece pela origem, escolha com consciência.",
    summary: "Entenda o que muda entre as preparações e o que observar antes de escolher.",
    introduction: "Rapé não é uma preparação única. Cada mistura tem seus ingredientes, características e uma relação com os povos que a preparam. Conhecer essa origem é o primeiro passo para uma escolha cuidadosa.",
    imageFolder: "first-hape",
    sections: [
      { title: "Conheça a origem", body: "Observe o povo, o lugar e os ingredientes associados à preparação. Mesmo dentro de uma mesma tradição, as misturas podem ser diferentes. Leia a história e a descrição de cada produto antes de escolher.", image: "source-and-ingredients.webp", alt: "Preparação de rapé e ingredientes de origem vegetal" },
      { title: "Escolha com calma", body: "Não é preciso escolher muitas preparações de uma vez. Dedique tempo a entender os ingredientes e o contexto de cada uma. Uma descrição de maior intensidade não significa que um produto seja melhor para começar.", image: "/assets/home/matcher/products/rape-huni-kuin-tradicao.jpg", alt: "Rapé Huni Kuin Tradição da Medicina Sagrada" },
      { title: "Respeite seus limites", body: "Leia os ingredientes: algumas preparações contêm tabaco e nicotina. Este guia apresenta contexto cultural e não substitui orientação profissional sobre saúde nem acompanhamento por uma pessoa experiente. Em caso de dúvida, procure orientação antes de decidir.", image: "respect-your-limits.webp", alt: "Lua entre as árvores da floresta" },
    ],
    checklist: ["Origem e ingredientes identificados", "Descrição individual lida com atenção", "Dúvidas esclarecidas antes de escolher", "Um aplicador pessoal bem cuidado"],
    collection: "rape", collectionTitle: "Cada preparação, uma origem.", collectionCopy: "Leve esse cuidado para a sua escolha. Conheça os rapés disponíveis e compare a origem, os ingredientes e a descrição de cada preparação, no seu tempo.",
  },
  {
    slug: "escolher-aplicador", label: "Escolhendo um aplicador", title: "Kuripe ou tepi? Entenda a diferença.",
    summary: "Conheça as duas formas tradicionais de aplicador e os cuidados com cada peça.",
    introduction: "A escolha de um aplicador envolve mais do que sua aparência. A forma, o uso e os cuidados com a peça também importam. Kuripes e tepis foram feitos para situações diferentes.",
    imageFolder: "choose-applicator",
    sections: [
      { title: "Kuripe: uma peça de uso pessoal", body: "O kuripe é um aplicador compacto, geralmente em formato de V, tradicionalmente utilizado para autoaplicação. Observe o ângulo, o acabamento e as dimensões da peça. Diferentes materiais e formas fazem parte da diversidade desse artesanato.", image: "kuripe-personal-use.webp", alt: "Kuripe de madeira em um ambiente de floresta" },
      { title: "Tepi: uma prática compartilhada", body: "O tepi é um aplicador mais longo, utilizado por uma pessoa em outra. Essa prática envolve consentimento, confiança, experiência e comunicação cuidadosa. Ele tem uma função própria e não é simplesmente um kuripe maior.", image: "tepi-assisted-use.webp", alt: "Aplicador tepi de madeira com acabamento artesanal" },
      { title: "Cuide da sua peça", body: "Confira se as aberturas estão livres e se o acabamento é adequado. Siga as orientações de conservação do material, mantenha a peça seca e guarde-a em um local protegido. Trate o aplicador como um item pessoal e evite compartilhá-lo.", image: "applicator-fit-and-care.webp", alt: "Detalhe do acabamento de um aplicador artesanal" },
    ],
    checklist: ["Função do aplicador compreendida", "Forma e dimensões conferidas", "Acabamento e aberturas observados", "Orientações de conservação consultadas"],
    collection: "aplicadores", collectionTitle: "Conheça os aplicadores.", collectionCopy: "Peças tradicionais com diferentes materiais, formas e acabamentos. Leia as características de cada uma.",
  },
  {
    slug: "preparar-com-cuidado", label: "Preparando com cuidado", title: "Um momento de atenção pode ser simples.",
    summary: "Prepare um espaço tranquilo e reúna apenas o que você conhece e faz sentido para você.",
    introduction: "Você não precisa de uma composição elaborada ou de muitos objetos. Atenção, privacidade e cuidado podem orientar um começo mais consciente. Conheça o contexto da prática e respeite o conhecimento de quem a transmite.",
    imageFolder: "prepare-ritual",
    sections: [
      { title: "Abra espaço para a atenção", body: "Escolha um ambiente tranquilo, ventilado e sem pressa. Reduza as distrações e reserve tempo para compreender a prática. A preparação do espaço começa pelo cuidado com você e com as pessoas ao redor.", image: "make-room-for-attention.webp", alt: "Espaço tranquilo e ventilado preparado com cuidado" },
      { title: "Reconheça sua intenção", body: "Uma intenção simples, como gratidão ou reflexão, pode ajudar a dar atenção ao momento. Ela não precisa prometer um resultado. Respeitar a origem de uma tradição também significa reconhecer que nem todo conhecimento pode ser resumido em um guia.", image: "/assets/home/matcher/silencio-mental-paz.webp", alt: "A lua vista entre as árvores da floresta" },
      { title: "Finalize com cuidado", body: "Guarde os objetos em segurança e siga as orientações de limpeza e conservação do seu aplicador. Reserve tempo para observar como você está. Se houver desconforto ou incerteza, interrompa a prática e procure orientação adequada.", image: "close-with-care.webp", alt: "Aplicador pessoal guardado com cuidado" },
    ],
    checklist: ["Contexto da prática compreendido", "Um espaço tranquilo e ventilado", "Objetos pessoais limpos e conservados", "Tempo para começar e finalizar sem pressa"],
    collection: "incensos", collectionTitle: "Prepare o ambiente com intenção.", collectionCopy: "Incensos e resinas podem acompanhar a preparação do seu espaço. Conheça os aromas e ingredientes de cada opção e siga as orientações de uso, mantendo o ambiente ventilado.",
  },
];

// Contexto adaptado do glossário de src/lib/content/learn.ts do Haux Haux.
// Não atribui efeitos, produtores ou relações comerciais a um povo.
export const learnPeople = [
  { name: "Apurinã", slug: "apurina", title: "Saberes ligados ao rio Purus", choosingTitle: "Território e plantas", choosingCopy: "Conheça as plantas descritas e sua relação com a origem informada no produto.", image: "rape-apurina", summary: "Um povo de língua Aruak, com comunidades ligadas à região do rio Purus.", body: "As comunidades Apurinã têm vínculos com territórios do Amazonas e do Acre. Seus conhecimentos e suas relações com as plantas têm características próprias. Ao explorar uma preparação, observe os ingredientes e a origem descritos individualmente." },
  { name: "Caboclo", slug: "caboclo", title: "Encontros que formam uma tradição", choosingTitle: "Quem prepara", choosingCopy: "Procure o nome de quem produz e o lugar de origem para compreender essa tradição regional.", image: "caboclo", summary: "Uma identidade regional formada por gerações de encontros culturais no Brasil.", body: "Caboclo não é o nome de uma única nação indígena. É uma identidade regional ampla, ligada a diferentes histórias e trocas culturais. Por isso, o nome de quem prepara, o lugar e os ingredientes ajudam a compreender cada produto." },
  { name: "Huni Kuin", slug: "huni-kuin", title: "Arte, plantas e conhecimento compartilhado", choosingTitle: "Diversidade de misturas", choosingCopy: "Compare as descrições: preparações Huni Kuin podem reunir ingredientes diferentes.", image: "huni-kuin", summary: "Um povo de língua Pano, com comunidades no Brasil e no Peru.", body: "Também historicamente conhecidos como Kaxinawá, os Huni Kuin mantêm uma diversidade de conhecimentos artísticos, cerimoniais e sobre as plantas. Uma origem compartilhada não torna todas as preparações iguais: leia a descrição de cada uma." },
  { name: "Katukina", slug: "katukina", title: "Identidade para além de um nome", choosingTitle: "Comunidade de origem", choosingCopy: "Confira a identificação da comunidade, além do nome Katukina usado na categoria.", image: "katukina", summary: "Um nome historicamente associado a mais de um povo e comunidade indígena.", body: "No Acre, o nome é frequentemente associado a comunidades Katukina Pano, algumas das quais se identificam como Noke Ko'ĩ. A identificação da comunidade e de quem prepara importa mais do que o nome de uma categoria isolada." },
  { name: "Kuntanawa", slug: "kuntanawa", title: "Uma história de fortalecimento cultural", choosingTitle: "História da preparação", choosingCopy: "Leia o contexto apresentado em cada produto e as plantas que compõem sua preparação.", image: "kuntanawa", summary: "Um povo do Acre com uma história de fortalecimento cultural e territorial.", body: "A história contemporânea dos Kuntanawa inclui o fortalecimento da identidade e das práticas culturais, após gerações de violência e pressão. Ao conhecer suas preparações, observe as plantas e a história informadas em cada descrição." },
  { name: "Nukini", slug: "nukini", title: "Território e continuidade no alto Juruá", choosingTitle: "Ingredientes e relatos", choosingCopy: "Relacione os ingredientes aos relatos de origem para conhecer as particularidades de cada mistura.", image: "nukini", summary: "Um povo de língua Pano, ligado ao oeste do Acre, na região do alto Juruá.", body: "A continuidade dos conhecimentos, o cuidado com o território e a revitalização cultural fazem parte da história recente dos Nukini. Ingredientes e relatos de origem ajudam a distinguir as preparações dentro dessa tradição." },
  { name: "Puyanawa", slug: "puyanawa", title: "Uma cultura além do catálogo", choosingTitle: "Um ponto de partida", choosingCopy: "Use as informações do produto como início da pesquisa e aprofunde a leitura com fontes da comunidade.", image: "puyanawa", summary: "Conheça as preparações identificadas com o nome Puyanawa.", body: "Use o nome como ponto de partida para conhecer a origem, sem reduzir uma cultura às características de um produto. Consulte as informações disponíveis em cada preparação e busque as vozes das próprias comunidades para aprofundar seu conhecimento." },
  { name: "Shanenawa", slug: "shanenawa", title: "Conhecimento pelas vozes da comunidade", choosingTitle: "Escuta e contexto", choosingCopy: "Busque relatos Shanenawa para ampliar o contexto que uma descrição comercial consegue oferecer.", image: "shanenawa", summary: "Conheça as preparações identificadas com o nome Shanenawa.", body: "Observe a origem, os ingredientes e a história de cada preparação. Um nome compartilhado não significa que todos os produtos sejam iguais. Para compreender a cultura além do catálogo, priorize os relatos e conhecimentos transmitidos pelas próprias comunidades." },
  { name: "Shawãdawa", slug: "shawadawa", title: "O nome que preserva uma identidade", choosingTitle: "Respeito à autodenominação", choosingCopy: "Reconheça o nome Shawãdawa ao consultar a origem e a história apresentadas na preparação.", image: "shawadawa", summary: "Um povo do Acre com vínculos profundos com a região do alto Juruá.", body: "O povo Arara aqui representado se autodenomina Shawãdawa e integra o universo linguístico Pano. Sua história inclui resistência à violência e aos deslocamentos do período da borracha. Preserve esse nome ao conhecer a origem de suas preparações." },
  { name: "Yawanawá", slug: "yawanawa", title: "Língua, arte e memória no rio Gregório", choosingTitle: "Características de cada produto", choosingCopy: "Observe as plantas de cada opção Yawanawá: uma origem comum não torna as misturas equivalentes.", image: "yawanawa", summary: "Um povo de língua Pano, ligado ao território indígena do rio Gregório, no Acre.", body: "A transmissão da língua, das artes e dos conhecimentos cerimoniais faz parte do fortalecimento cultural Yawanawá. Ao explorar os produtos, compare as plantas e os ingredientes descritos: uma mesma origem não torna as preparações intercambiáveis." },
] as const;

export const guideImage = (guide: LearnGuide, image: string) => image.startsWith("/") ? image : `/assets/learn/${guide.imageFolder}/${image}`;
export const getLearnGuide = (slug: string) => learnGuides.find((guide) => guide.slug === slug);

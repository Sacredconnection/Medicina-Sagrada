import { parseDocument } from "htmlparser2";
import { findAll, getOuterHTML, removeElement, replaceElement, textContent } from "domutils";
import type { WordPressContent } from "./types";

type ArticleCta = { title: string; description: string; label: string; href: string };
const category = (path: string) => `/product-category/${path}/`;
const rape: ArticleCta = {
  title: "Cada rapé tem uma história",
  description: "Conhecer o rapé também é se aproximar de quem o prepara. Venha descobrir os rapés da nossa loja, suas origens e os saberes que acompanham cada composição.",
  label: "Conheça nossos rapés", href: category("rape"),
};
const sananga: ArticleCta = {
  title: "Um olhar mais próximo para a Sananga",
  description: "Se essa leitura despertou sua curiosidade, venha conhecer a Sananga da nossa loja e saber mais sobre sua origem. Essa descoberta pode continuar por aqui.",
  label: "Conheça nossa Sananga", href: category("medicinais/sananga-medicinais"),
};
const applicators: ArticleCta = {
  title: "O cuidado também está no sopro",
  description: "Kuripes e tepis fazem parte dessa tradição. Conheça os aplicadores feitos por mãos indígenas, observe os detalhes de cada peça e encontre a que faz sentido para você.",
  label: "Conheça os kuripes e tepis", href: category("acessorios/aplicadores"),
};
const craft: ArticleCta = {
  title: "A arte da floresta, mais perto de você",
  description: "Há muito para conhecer nos materiais, nas cores e nos detalhes do artesanato indígena. Venha olhar nossas peças com calma e descobrir suas origens.",
  label: "Conheça o artesanato indígena", href: category("artesanato"),
};
const medicinals: ArticleCta = {
  title: "A floresta ainda tem muito a nos ensinar",
  description: "O cuidado com esses saberes começa pela escuta e pelo respeito a quem os mantém vivos. Conheça as medicinais da nossa loja e continue aprendendo sobre suas origens.",
  label: "Conheça nossas medicinais", href: category("medicinais"),
};
const kuntanawa = (title: string, description: string): ArticleCta => ({
  title, description, label: "Conheça os rapés Kuntanawa", href: category("rape/kuntanawa"),
});

// Copy reviewed against the published articles; this map keeps future editing local.
export const articleCtas: Record<string, ArticleCta> = {
  "uma-jornada-de-iluminacao-o-feitor-jesse-conta-a-historia-por-tras-da-criacao-do-seu-rape-parica": {
    title: "Um encontro com a tradição Cabocla",
    description: "Jesse compartilhou um pouco do caminho que deu origem ao seu Paricá. Se essa história tocou você, venha conhecer nossos rapés Caboclos e descobrir o que acompanha cada preparo.",
    label: "Conheça os rapés Caboclos", href: category("rape/caboclo"),
  },
  "rape-do-mes-kuntanawa-flor-de-samauma": kuntanawa("A Samaúma nos convida a conhecer mais", "O tempo das flores e o cuidado na colheita fazem parte dessa história. Venha conhecer os rapés Kuntanawa da nossa loja e descobrir outros preparos dessa tradição."),
  "pedro-univu-kuntanawa": kuntanawa("Mais perto dos saberes Kuntanawa", "Ouvir Pedro Univu é um convite a olhar para a floresta com atenção. Continue essa aproximação pelos rapés Kuntanawa e pelos saberes que acompanham seu feitio."),
  "conheca-os-kenes-os-grafismos-sagrados-indigenas": {
    title: "Histórias que ganham forma nas miçangas",
    description: "Depois de conhecer os kenês, que tal olhar mais de perto para essa arte? Conheça nossas peças de miçangas e aprecie os grafismos, as cores e o cuidado em cada detalhe.",
    label: "Conheça as peças de miçangas", href: category("artesanato/micangas"),
  },
  "rape": rape,
  "rape-o-inicio": { ...rape, title: "Um saber que atravessa gerações", description: "As histórias de origem nos lembram de olhar para o rapé com respeito. Venha conhecer os rapés da nossa loja e se aproximar das tradições que fazem parte de cada preparo." },
  "100-maneiras-de-explodir-rape": applicators,
  "propriedades-medicinais-de-sananga": sananga,
  "tribo-amazonia-cria-enciclopedia-de-medicina-tradicional-de-500-paginas": medicinals,
  "cinzas-sagradas": { ...rape, title: "O que cada preparo tem para contar", description: "Agora que você conhece um pouco mais sobre as cinzas, vale olhar para cada rapé com essa atenção. Conheça nossos rapés e descubra as plantas, as cinzas e as origens de suas composições." },
  "huni-kuin-baimuka": {
    title: "O cuidado Huni Kuin em cada preparo",
    description: "Na história de Baimuka, o tabaco, o caneleiro e o Xipaô se encontram. Venha conhecer outros rapés Huni Kuin e descobrir um pouco mais dessa tradição através de suas composições.",
    label: "Conheça os rapés Huni Kuin", href: category("rape/huni-kuin"),
  },
  "kuntanawa-luta-e-reconstrucao": kuntanawa("Uma tradição que segue viva", "Conhecer a história Kuntanawa é também reconhecer a força de seus saberes. Se você quiser continuar essa descoberta, conheça os rapés desse povo disponíveis na nossa loja."),
};

const normalize = (text: string) => textContent(parseDocument(text)).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function getArticleCta(content: Pick<WordPressContent, "slug" | "title" | "content">): ArticleCta {
  if (articleCtas[content.slug]) return articleCtas[content.slug];
  // The headline outweighs passing mentions in the body of a future article.
  const topics: [RegExp, ArticleCta][] = [
    [/\bsananga\b/, sananga],
    [/\b(kuripes?|tepis?|aplicadores?|aplicar|aplicacao|sopro)\b/, applicators],
    [/\b(kenes?|grafismos?|micangas?|artesanato|artesas?)\b/, craft],
    [/\b(incensos?|defumacao|defumadores?|resinas?)\b/, { title: "Os aromas da floresta no seu espaço", description: "Que tal conhecer mais de perto esses aromas? Veja nossos incensos, resinas e defumadores e descubra os ingredientes de cada um.", label: "Conheça nossos incensos", href: category("incensos") }],
    [/\bkuntanawa\b/, kuntanawa("Mais perto da tradição Kuntanawa", "Venha conhecer os rapés Kuntanawa da nossa loja e descobrir um pouco mais sobre suas origens e composições.")],
    [/\bhuni kuin\b/, { ...articleCtas["huni-kuin-baimuka"], description: "Venha conhecer os rapés Huni Kuin e se aproximar dessa tradição através de suas origens e composições." }],
    [/\bcaboclos?\b/, { ...articleCtas["uma-jornada-de-iluminacao-o-feitor-jesse-conta-a-historia-por-tras-da-criacao-do-seu-rape-parica"], description: "Conheça nossos rapés Caboclos e descubra as origens e composições de cada preparo." }],
    [/\b(rape|cinzas?)\b/, rape],
    [/\b(plantas?|medicinais|medicina|saberes)\b/, medicinals],
  ];
  const match = (text: string) => topics.find(([pattern]) => pattern.test(normalize(text)))?.[1];
  return match(content.title.rendered) ?? match(content.content.rendered) ?? medicinals;
}

export function contextualizeArticleCta(content: Pick<WordPressContent, "slug" | "title" | "content">, html: string) {
  const cta = getArticleCta(content);
  const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const block = `<section class="article-shop-cta" aria-label="Produtos relacionados à matéria"><h2>${escape(cta.title)}</h2><p>${escape(cta.description)}</p><a class="button" href="${escape(cta.href)}">${escape(cta.label)}</a></section>`;
  const document = parseDocument(html);
  const previous = findAll((element) => {
    const classes = (element.attribs.class ?? "").split(/\s+/);
    return classes.includes("article-inline-cta") || (classes.includes("wp-block-buttons") &&
      findAll((child) => child.name === "a" && /^(?:https?:\/\/(?:www\.)?medicinasagrada\.com\.br)?\/(?:product-category|product|shop)\//.test(child.attribs.href ?? ""), element.children).length > 0);
  }, document.children);
  if (!previous.length) return `${html}\n${block}`;
  replaceElement(previous[0], parseDocument(block).children[0]);
  previous.slice(1).forEach(removeElement);
  return getOuterHTML(document, { encodeEntities: false });
}

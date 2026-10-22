const categoryDescriptionOverrides: Readonly<Record<string, string>> = {
  "/product-category/rape/": [
    "<p>Reunimos aqui uma diversidade de rapés indígenas e caboclos, preparados a partir de saberes ancestrais que atravessam gerações. Cada receita honra as tradições de seu povo de origem, respeitando seus modos de preparo, suas matérias-primas e sua relação com a floresta.</p>",
    "<p>Que cada rapé seja recebido com respeito, presença e consciência, reconhecendo os povos e os conhecimentos que mantêm viva essa tradição.</p>",
  ].join(""),
};

export function getCategoryDescription(pathname: string, fallback: string) {
  return categoryDescriptionOverrides[pathname] ?? fallback;
}

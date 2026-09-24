export type SearchValues = Record<string, string | string[] | undefined>;
export const sortOptions = {
  destaque: { label: "Destaques", orderby: "menu_order", order: "asc" },
  recentes: { label: "Mais recentes", orderby: "date", order: "desc" },
  menor_preco: { label: "Menor preço", orderby: "price", order: "asc" },
  maior_preco: { label: "Maior preço", orderby: "price", order: "desc" },
  populares: { label: "Mais vendidos", orderby: "popularity", order: "desc" },
  avaliados: { label: "Melhor avaliados", orderby: "rating", order: "desc" },
} as const;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
const price = (value: string) => /^\d{1,6}([.,]\d{1,2})?$/.test(value) ? Math.round(Number(value.replace(",", ".")) * 100) : undefined;
export function parseCatalogQuery(values: SearchValues) {
  const sort = first(values.ordem);
  const minimum = price(first(values.min));
  const maximum = price(first(values.max));
  const rawCategories = Array.isArray(values.categoria) ? values.categoria : [values.categoria ?? ""];
  const categories = [...new Set(rawCategories.flatMap(value => value.split(",")).filter(value => /^\d+$/.test(value)).map(Number).filter(value => Number.isSafeInteger(value) && value > 0))].slice(0, 50);
  const page = Number(first(values.pagina));
  const invalidPrice = (!!first(values.min) && minimum === undefined) || (!!first(values.max) && maximum === undefined) || (minimum !== undefined && maximum !== undefined && minimum > maximum);
  return {
    q: first(values.q).trim().slice(0, 80),
    sort: Object.hasOwn(sortOptions, sort) ? sort as keyof typeof sortOptions : "destaque" as const,
    min: invalidPrice ? undefined : minimum,
    max: invalidPrice ? undefined : maximum,
    stock: first(values.estoque) === "1",
    sale: first(values.oferta) === "1",
    categories,
    page: Number.isSafeInteger(page) && page > 0 && page <= 1000 ? page : 1,
    invalidPrice,
  };
}
export type CatalogQuery = ReturnType<typeof parseCatalogQuery>;
export function catalogSearch(query: CatalogQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.sort !== "destaque") params.set("ordem", query.sort);
  if (query.min !== undefined) params.set("min", String(query.min / 100));
  if (query.max !== undefined) params.set("max", String(query.max / 100));
  if (query.stock) params.set("estoque", "1");
  if (query.sale) params.set("oferta", "1");
  for (const category of query.categories) params.append("categoria", String(category));
  return params;
}

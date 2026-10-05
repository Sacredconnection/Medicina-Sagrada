import { ProductCard } from "@/components/product-card";
import { getEthnicityTheme } from "@/lib/ethnicity-colors";
import { selectOtherEthnicityProducts } from "@/lib/other-ethnicity-products";
import type { WooCategory, WooProduct } from "@/lib/types";
import { getProducts } from "@/lib/woocommerce";

export async function OtherEthnicityProducts({ category, categories }: {
  category: WooCategory;
  categories: WooCategory[];
}) {
  const currentTheme = getEthnicityTheme([category]);
  const rapeCategory = categories.find(({ slug }) => slug === "rape");
  if (!currentTheme || !rapeCategory) return null;

  const ethnicityCategories = categories.filter((item) =>
    item.parent === rapeCategory.id && getEthnicityTheme([item])
  );
  const excludedIds = [category.id, ...ethnicityCategories
    .filter((item) => getEthnicityTheme([item])?.name === currentTheme.name)
    .map(({ id }) => id)];
  const otherIds = ethnicityCategories
    .filter(({ id }) => !excludedIds.includes(id))
    .map(({ id }) => id);
  if (!otherIds.length) return null;
  let products: WooProduct[] = [];

  try {
    for (let page = 1; page <= 50; page += 1) {
      const batch = await getProducts({ categoryId: rapeCategory.id, perPage: 100, page });
      // Greedy selection never revisits discarded candidates. Retain only the
      // chosen cards between pages, preserving their original catalog order.
      products = selectOtherEthnicityProducts([...products, ...batch], excludedIds, otherIds);
      const representedIds = new Set(products.flatMap(product => product.categories.map(({ id }) => id)));
      if (products.length === 4 || batch.length < 100 || otherIds.every(id => representedIds.has(id))) break;
    }
  } catch (error) {
    console.warn("Não foi possível carregar rapés de outros povos.", error);
  }

  if (!products.length) return null;

  return (
    <section className="other-ethnicity-products" aria-labelledby="other-ethnicity-products-title">
      <div className="other-ethnicity-products-heading">
        <h2 id="other-ethnicity-products-title">Conheça rapés de outros povos</h2>
        <p>Continue explorando as medicinas de outras origens.</p>
      </div>
      <div className="product-grid other-ethnicity-products-grid" role="group" aria-label="Rapés de outros povos" tabIndex={0}>
        {products.map((product) => <ProductCard key={product.id} product={product} headingLevel={3} />)}
      </div>
      <span className="scroll-hint other-ethnicity-products-scroll-hint" aria-hidden="true">
        Deslize para ver mais
      </span>
    </section>
  );
}

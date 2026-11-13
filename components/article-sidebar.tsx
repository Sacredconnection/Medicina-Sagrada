import Image from "next/image";
import Link from "next/link";
import { wooFetch } from "@/lib/api";
import { plainText } from "@/lib/html";
import { canonicalizeEthnicityNames } from "@/lib/ethnicity-colors";
import { getAllProductCategories } from "@/lib/woocommerce";
import { getPurchasePrice } from "@/lib/purchase-price";
import { PurchasePrice } from "@/components/purchase-price";
import type { WooProduct } from "@/lib/types";

function ProductList({ title, products }: { title: string; products: WooProduct[] }) {
  if (!products.length) return null;
  return <section className="article-sidebar-section" aria-label={title}>
    <h2>{title}</h2>
    <ul className="article-sidebar-products">
      {products.map((product) => {
        const image = product.images[0];
        const rating = Number(product.average_rating);
        return <li key={product.id}>
          <Link href={`/product/${product.slug}/`}>
            <div>
              <h3>{canonicalizeEthnicityNames(plainText(product.name))}</h3>
              {product.review_count > 0 && rating > 0 ? <span className="article-sidebar-rating" aria-label={`${rating.toLocaleString("pt-BR")} de 5 estrelas`}>{rating.toLocaleString("pt-BR")} / 5</span> : null}
              <PurchasePrice price={getPurchasePrice(product)} currency={product.prices} compact />
            </div>
            {image ? <Image src={image.src} alt="" width={64} height={64} sizes="64px" /> : null}
          </Link>
        </li>;
      })}
    </ul>
  </section>;
}

export async function ArticleSidebar() {
  // Editorial reading remains available if the catalog is temporarily offline.
  const categories = await getAllProductCategories().catch(() => []);
  const rape = categories.find(({ slug }) => slug === "rape");
  const ethnicities = rape ? categories.filter(({ parent, count }) => parent === rape.id && count > 0) : [];
  const load = (orderby: "date" | "popularity") => rape
    ? wooFetch<WooProduct[]>("products", { category: rape.id, per_page: 4, orderby, order: "desc", catalog_visibility: "catalog" }, ["woocommerce", "products"]).catch(() => [])
    : Promise.resolve([]);
  const [latest, popular] = await Promise.all([load("date"), load("popularity")]);

  return <aside className="article-sidebar" aria-label="Explore os rapés">
    <section className="article-sidebar-section">
      <h2>Encontre seu rapé</h2>
      <form action="/product-category/rape/" method="get" className="article-sidebar-filters">
        <label htmlFor="article-rape-search">Buscar rapé</label>
        <input id="article-rape-search" type="search" name="q" placeholder="Nome ou ingrediente" maxLength={80} />
        {ethnicities.length ? <>
          <label htmlFor="article-rape-category">Povo / etnia</label>
          <select id="article-rape-category" name="categoria" defaultValue="">
            <option value="">Todos os povos</option>
            {ethnicities.map((category) => <option key={category.id} value={category.id}>{canonicalizeEthnicityNames(plainText(category.name))}</option>)}
          </select>
        </> : null}
        <label htmlFor="article-rape-sort">Ordenar por</label>
        <select id="article-rape-sort" name="ordem" defaultValue="populares">
          <option value="populares">Mais vendidos</option>
          <option value="recentes">Lançamentos</option>
          <option value="menor_preco">Menor preço</option>
          <option value="maior_preco">Maior preço</option>
        </select>
        <button type="submit">Ver rapés</button>
      </form>
    </section>
    <ProductList title="Lançamentos" products={latest} />
    <ProductList title="Mais vendidos" products={popular} />
    <Link className="article-sidebar-catalog" href="/product-category/rape/">Ver todos os rapés</Link>
  </aside>;
}

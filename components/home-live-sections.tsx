import Link from "next/link";
import { HomeProductGrid } from "@/components/home-product-grid";
import { HomeKitsSection } from "@/components/home-kit-grid";
import { HomeYoutubeSection } from "@/components/home-youtube-section";
import { ProductMatcher } from "@/components/product-matcher";
import { getHomeKitBanners } from "@/lib/home-content";
import { getProducts, getProductCategoryBySlug, getProductsBySlugs } from "@/lib/woocommerce";
import { getYouTubeVideos } from "@/lib/youtube";
import { toRitualCatalog } from "@/lib/ritual-catalog";
import { ritualsData } from "@/lib/rituals-data";

export async function HomeProducts() {
  const products = await getProducts({ perPage: 8, orderby: "popularity" }).catch(() => null);
  if (!products?.length) return <div className="catalog-empty" role="status">
    <p>{products ? "Novos produtos em breve." : "Não foi possível carregar os produtos agora."}</p>
    <Link href="/busca/">Consultar o catálogo</Link>
  </div>;
  return <HomeProductGrid products={products} />;
}

export async function RitualJourney({ productPage = false }: { productPage?: boolean }) {
  const slugs = Object.values(ritualsData).flatMap(ritual => [
    ...ritual.produtoPrincipal.candidatos.map(candidate => candidate.slug), ritual.aplicador.slug,
  ]);
  const products = await getProductsBySlugs(slugs).catch(() => []);
  return <ProductMatcher products={toRitualCatalog(products)} {...(productPage ? { introTitle: <>Está <strong>indeciso?</strong></> } : {})} />;
}

export async function HomeKits() {
  const category = await getProductCategoryBySlug("kits").catch(() => null);
  if (!category) return null;
  const products = await getProducts({ categoryId: category.id, perPage: 12 }).catch(() => []);
  if (!products.length) return null;
  return <HomeKitsSection banners={getHomeKitBanners(products)} />;
}

export async function HomeVideos() {
  return <HomeYoutubeSection videos={await getYouTubeVideos()} />;
}

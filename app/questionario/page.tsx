import Link from "next/link";
import { ProductMatcher } from "@/components/product-matcher";
import { toRitualCatalog } from "@/lib/ritual-catalog";
import { getAllProducts } from "@/lib/woocommerce";
import { createMetadata } from "@/lib/seo";

export const revalidate = 900;
export const metadata = createMetadata({
  title: "Questionário para escolher seu rapé",
  description: "Responda sobre sua intenção e experiência para receber uma sugestão de rapé para o seu momento.",
  pathname: "/questionario/",
});

export default async function QuestionnairePage() {
  const products = await getAllProducts().catch(() => []);
  return <div className="questionnaire-page">
    <nav className="container questionnaire-navigation" aria-label="Você está aqui">
      <Link href="/intencoes/">Explorar todas as intenções</Link>
      <span>Questionário de rapé</span>
    </nav>
    <ProductMatcher products={toRitualCatalog(products)} questionnaire />
  </div>;
}

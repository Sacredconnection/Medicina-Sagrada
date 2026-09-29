import { config } from "@/lib/config";
import { diagnosticRequest, type DiagnosticCheck } from "@/lib/diagnostic-request";

type PageSample = { id: number; slug: string; title: { rendered: string } };
type ProductSample = { id: number; slug: string; name: string };

export type ContentDiagnostic = {
  checkedAt: string;
  healthy: boolean;
  wordpress: DiagnosticCheck & { sample?: { id: number; slug: string; title: string } };
  woocommerce: DiagnosticCheck & { sample?: ProductSample };
};

export async function runContentDiagnostic(): Promise<ContentDiagnostic> {
  const [wordpress, woocommerce] = await Promise.all([
    diagnosticRequest(
      `${config.wordpressApiUrl}/wp/v2/pages?per_page=1&status=publish`,
      "/wp-json/wp/v2/pages",
      (data): data is PageSample[] => Array.isArray(data) && data.every(item =>
        item && typeof item.id === "number" && typeof item.slug === "string" && typeof item.title?.rendered === "string"),
    ),
    diagnosticRequest(
      `${config.wooStoreApiUrl}/products?per_page=1&status=publish`,
      "/wp-json/wc/store/v1/products",
      (data): data is ProductSample[] => Array.isArray(data) && data.every(item =>
        item && typeof item.id === "number" && typeof item.slug === "string" && typeof item.name === "string"),
    ),
  ]);
  const page = wordpress.data?.[0];
  const product = woocommerce.data?.[0];
  return {
    checkedAt: new Date().toISOString(),
    healthy: wordpress.check.ok && woocommerce.check.ok,
    wordpress: {
      ...wordpress.check,
      ...(wordpress.data ? { message: `${wordpress.data.length} página de amostra recuperada.` } : {}),
      ...(page ? { sample: { id: page.id, slug: page.slug, title: page.title.rendered } } : {}),
    },
    woocommerce: {
      ...woocommerce.check,
      ...(woocommerce.data ? { message: `${woocommerce.data.length} produto de amostra recuperado.` } : {}),
      ...(product ? { sample: { id: product.id, slug: product.slug, name: product.name } } : {}),
    },
  };
}

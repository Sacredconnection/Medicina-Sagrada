import { limitRequest } from "@/lib/rate-limit";
import { wooFetch } from "@/lib/api";
import type { WooProduct } from "@/lib/types";
import { withPurchasePrice } from "@/lib/purchase-price";

export async function GET(request: Request) {
  const limited = await limitRequest(request, "catalog");
  if (limited) return limited;
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[1-9]\d{0,9}$/.test(id)) {
    return Response.json({ error: "Escolha a opção do produto novamente." }, { status: 400 });
  }
  try {
    const product = await wooFetch<WooProduct>(`products/${id}`, {}, ["woocommerce", "products"], 15_000);
    if (product.id !== Number(id) || product.type !== "variation") {
      return Response.json({ error: "Opção não encontrada." }, { status: 404 });
    }
    return Response.json({ ...withPurchasePrice(product), price_html: "" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Não foi possível confirmar esta opção. Tente novamente." }, { status: 503 });
  }
}

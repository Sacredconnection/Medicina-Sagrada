import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { CartInputError, isSameOrigin, readCartBody } from "@/lib/cart-validation";
import { parseShippingInput } from "@/lib/shipping-validation";
import { estimateShipping, ShippingError } from "@/lib/shipping";

export const dynamic = "force-dynamic";
export const maxDuration = 45;
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function POST(request: Request) {
  if (!isSameOrigin(request, config.siteUrl)) return NextResponse.json({ error: "Origem não permitida." }, { status: 403, headers });
  let input;
  try { input = parseShippingInput(await readCartBody(request)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Solicitação inválida." }, { status: error instanceof CartInputError ? 400 : 422, headers }); }
  try { return NextResponse.json(await estimateShipping(input), { headers }); }
  catch (error) { return NextResponse.json({ error: error instanceof ShippingError ? error.message : "Não foi possível consultar o frete agora. Tente novamente em instantes." }, { status: error instanceof ShippingError ? error.status : 503, headers }); }
}

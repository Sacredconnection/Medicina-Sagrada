import { limitRequest } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { isSameOrigin, parseCartAction, readCartBody } from "@/lib/cart-validation";
import { cartResponse, commerceError, fetchCart, mutateCart, privateHeaders, readCartToken } from "@/lib/commerce";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const limited = await limitRequest(request, "cartRead");
  if (limited) return limited;
  try { return cartResponse(await fetchCart(await readCartToken())); }
  catch (error) { return commerceError(error); }
}

export async function POST(request: Request) {
  const limited = await limitRequest(request, "cartWrite");
  if (limited) return limited;
  if (!isSameOrigin(request, config.siteUrl)) return NextResponse.json({ error: "Atualize a página da loja e tente novamente." }, { status: 403, headers: privateHeaders });
  try { return cartResponse(await mutateCart(parseCartAction(await readCartBody(request)), await readCartToken())); }
  catch (error) { return commerceError(error); }
}

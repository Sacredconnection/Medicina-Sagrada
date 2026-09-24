import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { isSameOrigin, parseCartAction, readCartBody } from "@/lib/cart-validation";
import { cartResponse, commerceError, fetchCart, mutateCart, privateHeaders, readCartToken } from "@/lib/commerce";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return cartResponse(await fetchCart(await readCartToken())); }
  catch (error) { return commerceError(error); }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request, config.siteUrl)) return NextResponse.json({ error: "Origem não permitida." }, { status: 403, headers: privateHeaders });
  try { return cartResponse(await mutateCart(parseCartAction(await readCartBody(request)), await readCartToken())); }
  catch (error) { return commerceError(error); }
}

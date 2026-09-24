import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { isSameOrigin } from "@/lib/cart-validation";
import { CommerceError, commerceError, prepareCheckout, privateHeaders, readCartToken, setCartToken } from "@/lib/commerce";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request, config.siteUrl)) return NextResponse.json({ error: "Origem não permitida." }, { status: 403, headers: privateHeaders });
  try {
    const token = await readCartToken();
    if (!token) throw new CommerceError("Adicione um produto à sacola para continuar.", 400);
    const result = await prepareCheckout(token);
    const response = NextResponse.json({ url: result.url }, { headers: privateHeaders });
    setCartToken(response, result.token);
    return response;
  } catch (error) { return commerceError(error); }
}

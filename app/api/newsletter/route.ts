import { config } from "@/lib/config";
import { isSameOrigin, readCartBody } from "@/lib/cart-validation";
import { newsletterConfiguration, parseNewsletterInput, subscribeNewsletter } from "@/lib/newsletter";
import { limitRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };

export async function POST(request: Request) {
  const limited = await limitRequest(request, "newsletter");
  if (limited) return limited;
  if (!isSameOrigin(request, config.siteUrl)) return Response.json({ error: "Atualize a página da loja e tente novamente." }, { status: 403, headers });
  let input;
  try { input = parseNewsletterInput(await readCartBody(request)); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Confira seu e-mail e tente se cadastrar novamente." }, { status: 400, headers }); }
  try {
    if (!newsletterConfiguration()) throw new Error("Newsletter unavailable");
    if (!input.honeypot) await subscribeNewsletter(input.email);
    return Response.json({ status: "pending" }, { status: 202, headers });
  } catch {
    return Response.json({ error: "O cadastro está temporariamente indisponível. Tente novamente mais tarde." }, { status: 503, headers });
  }
}

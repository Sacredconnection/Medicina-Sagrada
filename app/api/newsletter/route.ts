import { config } from "@/lib/config";
import { isSameOrigin, readCartBody } from "@/lib/cart-validation";
import { parseNewsletterInput } from "@/lib/newsletter";
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
    if (!input.honeypot) {
      const url = new URL("https://medicinasagrada.us20.list-manage.com/subscribe/post-json");
      url.search = new URLSearchParams({
        u: "8133cf0f875cf89c2f7dba9ea", id: "0641d6c8e3", f_id: "00b51deff0",
        tags: "4251308", EMAIL: input.email, c: "signup",
      }).toString();
      const response = await fetch(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error("Newsletter unavailable");
      const payload = /^signup\(([\s\S]*)\);?$/.exec((await response.text()).trim());
      if (!payload) throw new Error("Unexpected newsletter response");
      const result = JSON.parse(payload[1]);
      if (result.result !== "success") throw new Error("Newsletter request declined");
    }
    return Response.json({ status: "received" }, { status: 202, headers });
  } catch {
    return Response.json({ error: "O cadastro está temporariamente indisponível. Tente novamente mais tarde." }, { status: 503, headers });
  }
}

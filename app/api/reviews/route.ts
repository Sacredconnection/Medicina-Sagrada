import { getReviews } from "@/lib/reviews";
import { config } from "@/lib/config";
import { CartInputError, isSameOrigin, readCartBody } from "@/lib/cart-validation";
import { parseReviewInput, ReviewSubmissionError, submitProductReview } from "@/lib/review-submission";
import { revalidateTag } from "next/cache";
import { createHash } from "node:crypto";

// Per-instance backstop; WordPress also enforces its own login/comment policies.
const attempts = new Map<string, { count: number; expires: number }>();

export async function POST(request: Request) {
  const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };
  if (!isSameOrigin(request, config.siteUrl)) return Response.json({ error: "Origem não permitida." }, { status: 403, headers });
  try {
    const input = parseReviewInput(await readCartBody(request));
    const now = Date.now();
    for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
    const key = createHash("sha256").update(input.username.toLowerCase()).digest("hex");
    const entry = attempts.get(key) ?? { count: 0, expires: now + 300_000 };
    if (entry.count >= 5 || (!attempts.has(key) && attempts.size >= 10000)) return Response.json({ error: "Muitas tentativas. Aguarde cinco minutos e tente novamente." }, { status: 429, headers: { ...headers, "Retry-After": "300" } });
    entry.count += 1; attempts.set(key, entry);
    const result = await submitProductReview(input, config);
    revalidateTag(`reviews:${input.productId}`, "max");
    revalidateTag("products", "max");
    return Response.json(result, { status: 201, headers });
  } catch (error) {
    const known = error instanceof ReviewSubmissionError || error instanceof CartInputError;
    return Response.json({ error: known ? error.message : "Não foi possível confirmar o envio. Confira suas avaliações antes de tentar novamente." }, { status: error instanceof ReviewSubmissionError ? error.status : error instanceof CartInputError ? 400 : 503, headers });
  }
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = Number(params.get("product")), page = Number(params.get("page") || 1);
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(page) || page < 1 || page > 1000) return Response.json({ error: "Consulta inválida." }, { status: 400, headers });
  try { return Response.json(await getReviews(id, page), { headers }); }
  catch { return Response.json({ error: "Não foi possível carregar as avaliações. Tente novamente." }, { status: 503, headers }); }
}

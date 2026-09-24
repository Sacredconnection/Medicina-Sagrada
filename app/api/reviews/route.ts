import { getReviews } from "@/lib/reviews";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = Number(params.get("product")), page = Number(params.get("page") || 1);
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(page) || page < 1 || page > 1000) return Response.json({ error: "Consulta inválida." }, { status: 400, headers });
  try { return Response.json(await getReviews(id, page), { headers }); }
  catch { return Response.json({ error: "Não foi possível carregar as avaliações. Tente novamente." }, { status: 503, headers }); }
}

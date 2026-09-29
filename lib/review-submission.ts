import { randomUUID } from "node:crypto";
import { parseDocument } from "htmlparser2";
import { findAll, textContent } from "domutils";

export class ReviewSubmissionError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

export type ReviewInput = { productId: number; rating: number; comment: string; username: string; password: string };

export function parseReviewInput(input: unknown): ReviewInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new ReviewSubmissionError("Solicitação inválida.");
  const value = input as Record<string, unknown>;
  if (!Number.isSafeInteger(value.productId) || (value.productId as number) < 1) throw new ReviewSubmissionError("Produto inválido.");
  if (!Number.isInteger(value.rating) || (value.rating as number) < 1 || (value.rating as number) > 5) throw new ReviewSubmissionError("Escolha uma nota de 1 a 5.");
  if (typeof value.comment !== "string" || !value.comment.trim() || value.comment.length > 3000) throw new ReviewSubmissionError("Escreva uma avaliação de até 3.000 caracteres.");
  if (typeof value.username !== "string" || !value.username.trim() || value.username.length > 254 || typeof value.password !== "string" || !value.password || value.password.length > 256) throw new ReviewSubmissionError("Informe o e-mail ou usuário e a senha da sua conta.");
  if (value.website) throw new ReviewSubmissionError("Solicitação inválida.");
  return { productId: value.productId as number, rating: value.rating as number, comment: value.comment.trim(), username: value.username.trim(), password: value.password };
}

// Use the customer's own WordPress session, never administrative API credentials.
// All cookies remain scoped to this request and are never returned to the browser.
export async function submitProductReview(input: ReviewInput, config: { wordpressSiteUrl: string; wooStoreApiUrl: string }, send: typeof fetch = fetch) {
  const source = new URL(config.wordpressSiteUrl);
  if (source.protocol !== "https:") throw new ReviewSubmissionError("O envio de avaliações está indisponível.", 503);
  const options = (): RequestInit => ({ cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(15_000) });
  const productResponse = await send(config.wooStoreApiUrl + "/products/" + input.productId, options());
  if (!productResponse.ok) throw new ReviewSubmissionError("Produto indisponível para avaliação.", 404);
  const product = await productResponse.json();
  const productUrl = new URL(product.permalink);
  if (product.id !== input.productId || product.type === "variation" || productUrl.origin !== source.origin || !productUrl.pathname.startsWith("/product/")) throw new ReviewSubmissionError("Produto inválido.");
  const login = await send(new URL("/wp-login.php", source), {
    ...options(), method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: "wordpress_test_cookie=WP%20Cookie%20check" },
    body: new URLSearchParams({ log: input.username, pwd: input.password, testcookie: "1", redirect_to: productUrl.toString() }),
  });
  const cookies = login.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).filter((cookie) => /^wordpress_(?:logged_in_|sec_|[a-f0-9]{32}=)/.test(cookie));
  if (![302, 303].includes(login.status) || !cookies.some((cookie) => /^wordpress_logged_in_[^=]+=.+/.test(cookie))) {
    throw new ReviewSubmissionError("Não foi possível entrar. Confira seu usuário e senha. Contas com verificação adicional precisam concluir o acesso na loja.", 401);
  }
  const authenticatedUrl = new URL(productUrl);
  authenticatedUrl.searchParams.set("_ms_review", randomUUID());
  const page = await send(authenticatedUrl, { ...options(), headers: { Cookie: cookies.join("; "), "Cache-Control": "no-cache" } });
  if (!page.ok) throw new ReviewSubmissionError("Não foi possível abrir o formulário de avaliação.", 503);
  const document = parseDocument(await page.text());
  const form = findAll((element) => element.name === "form" && element.attribs.id === "commentform", document.children)[0];
  if (!form) throw new ReviewSubmissionError("A loja não liberou avaliações para esta conta ou produto.", 403);
  const action = new URL(form.attribs.action || "/wp-comments-post.php", source);
  if (action.origin !== source.origin || action.pathname !== "/wp-comments-post.php") throw new ReviewSubmissionError("O formulário da loja não é compatível com o envio nesta página.", 503);
  const fields = findAll((element) => element.name === "input", form.children);
  const productField = fields.find((element) => element.attribs.name === "comment_post_ID");
  if (Number(productField?.attribs.value) !== input.productId) throw new ReviewSubmissionError("Produto do formulário inválido.", 503);
  const body = new URLSearchParams({ comment_post_ID: String(input.productId), comment_parent: "0", rating: String(input.rating), comment: input.comment, redirect_to: productUrl.toString() });
  for (const field of fields) {
    const name = field.attribs.name ?? "";
    if (field.attribs.type === "hidden" && /nonce/i.test(name) && name !== "_wp_unfiltered_html_comment") body.set(name, field.attribs.value ?? "");
  }
  const result = await send(action, { ...options(), method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookies.join("; "), Referer: productUrl.toString() }, body });
  const location = result.headers.get("location");
  if ([302, 303].includes(result.status) && location) {
    const receipt = new URL(location, source);
    if (receipt.origin === source.origin && receipt.pathname === productUrl.pathname && /^#comment-\d+$/.test(receipt.hash)) {
      return { message: "Avaliação recebida! Ela poderá passar por moderação antes de aparecer nesta página." };
    }
  }
  const errorDocument = parseDocument(await result.text());
  const error = findAll((element) => element.attribs.class?.split(/\s+/).includes("wp-die-message") ?? false, errorDocument.children)[0];
  const message = error ? textContent(error).replace(/\s+/g, " ").trim().slice(0, 500) : "Não foi possível confirmar o envio. Confira suas avaliações antes de tentar novamente.";
  throw new ReviewSubmissionError(message, result.status >= 400 && result.status < 500 ? result.status : 502);
}

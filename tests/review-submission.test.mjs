import test from "node:test";
import assert from "node:assert/strict";
import { parseReviewInput, submitProductReview } from "../lib/review-submission.ts";

const input = { productId: 336, rating: 5, comment: "Minha experiência com o produto.", username: "cliente", password: "test-password" };
const config = { wordpressSiteUrl: "https://store.example", wooStoreApiUrl: "https://store.example/wp-json/wc/store/v1" };
const product = () => Response.json({ id: 336, type: "variable", permalink: "https://store.example/product/awiry/" });
const login = () => new Response(null, { status: 302, headers: { "Set-Cookie": "wordpress_logged_in_test=customer-session; Secure; HttpOnly" } });
const form = () => new Response('<form id="commentform" action="https://store.example/wp-comments-post.php"><input type="hidden" name="comment_post_ID" value="336"><input type="hidden" name="_wpnonce" value="customer-nonce"></form>');

test("validates rating, credentials, text and product; ignores forged identity and approval", () => {
  for (const rating of [0, 6, 1.5, "5"]) assert.throws(() => parseReviewInput({ ...input, rating }));
  for (const extra of [{ productId: -1 }, { comment: " " }, { comment: "x".repeat(3001) }, { username: "" }, { password: "" }, { website: "spam" }]) assert.throws(() => parseReviewInput({ ...input, ...extra }));
  assert.deepEqual(parseReviewInput({ ...input, verified: true, status: "approved", user_id: 1 }), input);
});

test("submits with customer session and accepts a confirmed moderation receipt", async () => {
  const calls = [];
  const replies = [product(), login(), form(), new Response(null, { status: 302, headers: { Location: "https://store.example/product/awiry/?unapproved=123#comment-123" } })];
  const result = await submitProductReview(input, config, async (url, options) => { calls.push({ url: String(url), options }); return replies.shift(); });
  assert.match(result.message, /recebida/);
  assert.equal(calls.length, 4);
  assert.equal(calls[1].options.body.get("pwd"), input.password);
  assert.equal(calls[3].options.body.get("rating"), "5");
  assert.equal(calls[3].options.body.get("_wpnonce"), "customer-nonce");
  assert.equal(calls[3].options.body.has("pwd"), false);
  assert.equal(calls[3].options.body.has("user_id"), false);
  assert.equal(calls[3].options.headers.Cookie, "wordpress_logged_in_test=customer-session");
  for (const call of calls) { assert.equal(call.options.cache, "no-store"); assert.equal(call.options.redirect, "manual"); }
  assert.equal(JSON.stringify(result).includes("customer-session"), false);
});

test("failed login cannot create a review", async () => {
  let calls = 0;
  await assert.rejects(submitProductReview(input, config, async () => ++calls === 1 ? product() : new Response("Invalid login")), error => error.status === 401);
  assert.equal(calls, 2);
});

test("closed form or mismatched product cannot create a review", async () => {
  for (const html of ["Reviews closed", '<form id="commentform"><input name="comment_post_ID" value="999"></form>']) {
    const replies = [product(), login(), new Response(html)];
    let calls = 0;
    await assert.rejects(submitProductReview(input, config, async () => { calls++; return replies.shift(); }));
    assert.equal(calls, 3);
  }
});

test("duplicate review errors are preserved, unexpected redirects never report success", async () => {
  for (const response of [new Response('<div class="wp-die-message">Avaliação duplicada.</div>', { status: 409 }), new Response(null, { status: 302, headers: { Location: "https://other.example/#comment-123" } }), new Response("OK")]) {
    const replies = [product(), login(), form(), response];
    await assert.rejects(submitProductReview(input, config, async () => replies.shift()), error => error.status === 409 ? error.message === "Avaliação duplicada." : error.status === 502);
  }
});

test("external product URLs and insecure credential transport are rejected", async () => {
  await assert.rejects(submitProductReview(input, { ...config, wordpressSiteUrl: "http://store.example" }, async () => { throw Error("Must not request"); }), /indisponível/);
  let calls = 0;
  await assert.rejects(submitProductReview(input, config, async () => { calls++; return Response.json({ id: 336, permalink: "https://other.example/product/awiry/" }); }), /inválido/);
  assert.equal(calls, 1);
});

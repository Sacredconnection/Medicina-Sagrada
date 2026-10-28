import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { newsletterConfiguration, parseNewsletterInput, subscribeNewsletter } from "../lib/newsletter.ts";

test("newsletter exige consentimento explícito e valida endereço e honeypot", () => {
  assert.throws(() => parseNewsletterInput({ email: "a@example.com", consent: "true" }));
  assert.throws(() => parseNewsletterInput({ email: "invalid", consent: true }));
  assert.deepEqual(parseNewsletterInput({ email: " A@Example.com ", consent: true, website: "bot" }), { email: "a@example.com", honeypot: true });
});

test("Mailchimp usa confirmação, preserva opt-out e oculta erros do provedor", async () => {
  const names = ["MAILCHIMP_API_KEY", "MAILCHIMP_AUDIENCE_ID", "MAILCHIMP_SERVER_PREFIX"];
  const saved = Object.fromEntries(names.map(name => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  try {
    process.env.MAILCHIMP_API_KEY = "test-key-us21";
    process.env.MAILCHIMP_AUDIENCE_ID = "abc123";
    delete process.env.MAILCHIMP_SERVER_PREFIX;
    assert.equal(newsletterConfiguration().server, "us21");
    globalThis.fetch = async (url, options) => {
      assert.equal(url, `https://us21.api.mailchimp.com/3.0/lists/abc123/members/${createHash("md5").update("a@example.com").digest("hex")}`);
      assert.deepEqual(JSON.parse(options.body), { email_address: "a@example.com", status_if_new: "pending" });
      assert.equal(options.method, "PUT");
      assert.equal(options.redirect, "error");
      return Response.json({ status: "unsubscribed", email_address: "a@example.com" });
    };
    assert.equal(await subscribeNewsletter("a@example.com"), undefined);
    globalThis.fetch = async () => Response.json({ detail: "private provider data" }, { status: 400 });
    await assert.rejects(subscribeNewsletter("a@example.com"), { message: "Newsletter unavailable" });
    process.env.MAILCHIMP_SERVER_PREFIX = "attacker.example/path";
    assert.equal(newsletterConfiguration(), null);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name,value] of Object.entries(saved)) { if (value === undefined) delete process.env[name]; else process.env[name] = value; }
  }
});

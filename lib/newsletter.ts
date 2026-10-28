import { createHash } from "node:crypto";

export function newsletterConfiguration() {
  const key = process.env.MAILCHIMP_API_KEY?.trim();
  const audience = process.env.MAILCHIMP_AUDIENCE_ID?.trim();
  const server = process.env.MAILCHIMP_SERVER_PREFIX?.trim() || key?.split("-").at(-1);
  if (!key || !audience || !/^[a-zA-Z0-9]+$/.test(audience) || !server || !/^us\d+$/.test(server)) return null;
  return { key, audience, server };
}

export function parseNewsletterInput(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Confira seu e-mail e tente se cadastrar novamente.");
  const value = input as Record<string, unknown>;
  const email = typeof value.email === "string" ? value.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Informe um e-mail válido.");
  if (value.consent !== true) throw new Error("Confirme que deseja receber nossos e-mails.");
  return { email, honeypot: typeof value.website === "string" && value.website.trim().length > 0 };
}

export async function subscribeNewsletter(email: string) {
  const settings = newsletterConfiguration();
  if (!settings) throw new Error("Newsletter unavailable");
  const hash = createHash("md5").update(email).digest("hex");
  const response = await fetch(`https://${settings.server}.api.mailchimp.com/3.0/lists/${settings.audience}/members/${hash}`, {
    method: "PUT",
    headers: { Authorization: `Basic ${Buffer.from(`website:${settings.key}`).toString("base64")}`, "Content-Type": "application/json" },
    // Preserve existing contacts' subscription and unsubscribe choices.
    body: JSON.stringify({ email_address: email, status_if_new: "pending" }),
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Newsletter unavailable");
  // Never expose membership status, provider diagnostics, or contact data.
  await response.body?.cancel();
}

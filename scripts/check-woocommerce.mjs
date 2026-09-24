import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

// Read credentials only in this local/server-side process. Never print response
// bodies, Authorization, gateway settings, or URLs containing credentials.
const local = existsSync(".env.local") ? parseEnv(readFileSync(".env.local", "utf8")) : {};
const env = { ...local, ...process.env };
const key = env.WORDPRESS_CONSUMER_KEY;
const secret = env.WORDPRESS_CONSUMER_SECRET;
if (!key || !secret) {
  console.error("Preencha WORDPRESS_CONSUMER_KEY e WORDPRESS_CONSUMER_SECRET em .env.local.");
  process.exitCode = 1;
} else {
  const base = new URL(env.WORDPRESS_API_URL ?? "https://medicinasagrada.com.br/wp-json");
  if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash) {
    throw new Error("WORDPRESS_API_URL deve usar HTTPS e não conter credenciais, query ou fragmento.");
  }
  const headers = {
    Accept: "application/json",
    Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
    "Cache-Control": "no-store",
  };
  const wordpressAuthorization = env.WP_USER && env.WP_PASSWORD
    ? `Basic ${Buffer.from(`${env.WP_USER}:${env.WP_PASSWORD}`).toString("base64")}`
    : null;
  async function read(path, select, authorization = headers.Authorization) {
    try {
      const response = await fetch(`${base.href.replace(/\/$/, "")}${path}`, {
        headers: { ...headers, Authorization: authorization }, redirect: "error", signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) return { status: response.status, accessible: false };
      return { status: response.status, accessible: true, ...select(await response.json()) };
    } catch {
      return { accessible: false, error: "Não foi possível consultar. Confira a origem e a conexão." };
    }
  }
  const [payments, system, wordpressAdmin, wordpressPermissions] = await Promise.all([
    read("/wc/v3/payment_gateways", (data) => ({
      pagarme: data.filter((gateway) => gateway.id.startsWith("woo-pagarme-payments-")).map(({ id, enabled }) => ({ id, enabled })),
    })),
    read("/wc/v3/system_status", (data) => ({
      woocommerce: data.environment?.version,
      plugins: (data.active_plugins ?? []).filter(({ plugin }) => /pagarme-payments-for-woocommerce|litespeed-cache|medicina-sagrada-headless/.test(plugin)).map(({ plugin, version }) => ({ plugin, version })),
    })),
    wordpressAuthorization
      ? read("/wp/v2/plugins", (data) => ({ companionPlugin: data.some((plugin) => plugin.plugin.startsWith("medicina-sagrada-headless/") && plugin.status === "active") }), wordpressAuthorization)
      : { accessible: false, credentialsPresent: false },
    wordpressAuthorization
      ? read("/wp/v2/users/me?context=edit", (data) => ({ capabilities: Object.fromEntries(Object.entries(data.capabilities ?? {}).filter(([name]) => ["install_plugins", "activate_plugins", "upload_plugins", "manage_options"].includes(name))) }), wordpressAuthorization)
      : { accessible: false, credentialsPresent: false },
  ]);
  console.log(JSON.stringify({ origin: base.origin, payments, system, wordpressAdmin, wordpressPermissions }, null, 2));
  if (!payments.accessible || !system.accessible) process.exitCode = 1;
  if (!wordpressAdmin.accessible) {
    console.log(wordpressAuthorization
      ? "A senha de aplicação não permitiu consultar plugins. Confira as permissões e o status HTTP acima."
      : "WP_USER e WP_PASSWORD não estão preenchidos no ambiente salvo. Use o usuário WordPress e sua senha de aplicação para conferir as permissões administrativas.");
  }
}

export function validateReleaseConfig(env) {
  const checks = [];
  const add = (id, ok, message, optional = false) => checks.push({ id, status: ok ? "ok" : optional ? "optional" : "blocked", message });
  const url = (key) => {
    try {
      const parsed = new URL(env[key]);
      if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error();
      add(key, true, "URL HTTPS configurada.");
      return parsed;
    } catch { add(key, false, "Configure uma URL HTTPS sem credenciais, query ou fragmento."); return null; }
  };
  const site = url("NEXT_PUBLIC_SITE_URL"), wp = url("WORDPRESS_SITE_URL");
  const api = url("WORDPRESS_API_URL"), store = url("WOOCOMMERCE_STORE_API_URL");
  const checkout = url("WOOCOMMERCE_CHECKOUT_URL"), account = url("WOOCOMMERCE_ACCOUNT_URL");
  add("canonical", site?.href === "https://medicinasagrada.com.br/", "A origem publica deve ser https://medicinasagrada.com.br.");
  add("wordpress", wp?.href === "https://checkout.medicinasagrada.com.br/", "WordPress deve permanecer em https://checkout.medicinasagrada.com.br.");
  add("origins", !!site && !!wp && site.origin !== wp.origin && [api, store, checkout, account].every(item => item?.origin === wp.origin), "APIs, conta e checkout devem usar a origem WordPress, distinta do frontend.");
  add("paths", api?.pathname.replace(/\/$/, "") === "/wp-json" && store?.pathname.replace(/\/$/, "") === "/wp-json/wc/store/v1" && checkout?.pathname === "/checkout/" && account?.pathname === "/account/", "Confira os caminhos REST, checkout e conta.");
  add("secret", typeof env.REVALIDATION_SECRET === "string" && env.REVALIDATION_SECRET.length >= 32 && !/placeholder|change.?me|substitu|example/i.test(env.REVALIDATION_SECRET), "Segredo de revalidacao deve ser longo e compartilhado com WordPress.");
  const redis = env.RATE_LIMIT_REDIS_URL && env.RATE_LIMIT_REDIS_TOKEN;
  add("shared-rate-limit", !!redis && /^https:\/\/[^\s]+$/.test(env.RATE_LIMIT_REDIS_URL), "Configure URL e token Redis REST para limites compartilhados na Vercel.");
  add("newsletter", !!env.MAILCHIMP_API_KEY && !!env.MAILCHIMP_AUDIENCE_ID, "Sem Mailchimp completo, manter a newsletter oculta.", true);
  add("monthly-product", !!env.MONTHLY_PRODUCT_SLUG, "Sem escolha mensal, o menu continua Em breve.", true);
  add("public-secrets", !Object.keys(env).some(key => /^NEXT_PUBLIC_.*(?:SECRET|TOKEN|PASSWORD|API_KEY|CONSUMER)/i.test(key) && env[key]), "Nunca expor segredos em variaveis NEXT_PUBLIC_.");
  return checks;
}

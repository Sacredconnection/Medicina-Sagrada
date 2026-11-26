import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";

// No network, deployment, DNS or WordPress changes. Idempotent: never rotate an
// existing release secret or overwrite a prepared operator configuration.
const target = ".env.release.local";
const local = existsSync(".env.local") ? parseEnv(readFileSync(".env.local", "utf8")) : {};
if (!existsSync(target)) {
  const env = parseEnv(readFileSync("deploy/production.env.example", "utf8"));
  env.REVALIDATION_SECRET = local.REVALIDATION_SECRET?.length >= 32 ? local.REVALIDATION_SECRET : randomBytes(32).toString("hex");
  for (const key of ["RATE_LIMIT_REDIS_URL", "RATE_LIMIT_REDIS_TOKEN", "MONTHLY_PRODUCT_SLUG", "MAILCHIMP_API_KEY", "MAILCHIMP_AUDIENCE_ID", "MAILCHIMP_SERVER_PREFIX"]) {
    if (local[key]) env[key] = local[key];
  }
  writeFileSync(target, Object.entries(env).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join("\n") + "\n", { flag: "wx", mode: 0o600 });
}
const env = parseEnv(readFileSync(target, "utf8"));
if (!env.REVALIDATION_SECRET || env.REVALIDATION_SECRET.length < 32) throw new Error("REVALIDATION_SECRET precisa de pelo menos 32 caracteres no arquivo privado.");
const php = value => `'${value.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
mkdirSync("outputs/release", { recursive: true });
writeFileSync("outputs/release/wp-config-snippet.txt", [
  "// Inserir antes de 'stop editing' no wp-config.php. Arquivo privado: nao versionar.",
  `define( 'MS_HEADLESS_URL', ${php(env.NEXT_PUBLIC_SITE_URL)} );`,
  `define( 'MS_REVALIDATION_SECRET', ${php(env.REVALIDATION_SECRET)} );`,
  "",
].join("\n"), { mode: 0o600 });
console.log("Preparado: .env.release.local e outputs/release/wp-config-snippet.txt (privados, ignorados pelo Git).");
console.log("Ambiente local preservado. Nenhum deploy, DNS ou WordPress foi alterado.");

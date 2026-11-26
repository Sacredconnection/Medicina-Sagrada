import { createHash } from "node:crypto";

type Bucket = { count: number; expires: number };
const buckets = new Map<string, Bucket>();
const WINDOW = 60_000;
const MAX_BUCKETS = 10_000;
const policies = { cartRead: 120, cartWrite: 60, checkout: 10, shipping: 20, catalog: 90, reports: 20, newsletter: 5 };
export type RatePolicy = keyof typeof policies;

export function consumeLimit(key: string, limit: number, now = Date.now()) {
  for (const [id, bucket] of buckets) if (bucket.expires <= now) buckets.delete(id);
  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= MAX_BUCKETS) return false;
    bucket = { count: 0, expires: now + WINDOW };
    buckets.set(key, bucket);
  }
  bucket.count++;
  return bucket.count <= limit;
}

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

// Only trust forwarding headers from a deployment that overwrites them.
// Self-hosting must explicitly configure a trusted reverse proxy header.
export function rateIdentity(request: Request) {
  const header = process.env.VERCEL ? "x-vercel-forwarded-for" : process.env.RATE_LIMIT_IP_HEADER;
  const ip = header ? request.headers.get(header)?.split(",")[0].trim().slice(0, 128) : undefined;
  const session = request.headers.get("cookie")?.match(/(?:^|;\s*)ms_cart=([^;]+)/)?.[1];
  return { ip: ip ? digest(ip) : "unknown", session: session ? digest(session) : undefined };
}

async function sharedLimit(key: string, limit: number) {
  const url = process.env.RATE_LIMIT_REDIS_URL;
  const token = process.env.RATE_LIMIT_REDIS_TOKEN;
  if (!url && !token) return consumeLimit(key, limit);
  if (!url || !token || new URL(url).protocol !== "https:") throw new Error("Invalid limiter configuration");
  // Atomic increment + expiry; no IP, cookie, or cart token is sent to Redis.
  const script = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return n";
  const response = await fetch(url, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["EVAL", script, "1", `ms:limit:${key}`, String(WINDOW)]),
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(2000),
  });
  if (!response.ok) throw new Error("Rate limiter unavailable");
  const data = await response.json();
  if (!Number.isSafeInteger(data.result) || data.result < 1) throw new Error("Invalid limiter response");
  return data.result <= limit;
}

export async function limitRequest(request: Request, policy: RatePolicy): Promise<Response | null> {
  const headers = { "Cache-Control": "private, no-store", "Retry-After": "60", "X-Robots-Tag": "noindex" };
  try {
    const identity = rateIdentity(request);
    const limit = policies[policy];
    const checks = [sharedLimit(`${policy}:global`, limit * 50)];
    if (identity.ip !== "unknown") checks.push(sharedLimit(`${policy}:ip:${identity.ip}`, limit));
    if (identity.session) checks.push(sharedLimit(`${policy}:session:${identity.session}`, limit));
    // Without a trusted IP or session, bound anonymous requests as a group.
    if (identity.ip === "unknown" && !identity.session) checks.push(sharedLimit(`${policy}:anonymous`, limit * 5));
    if ((await Promise.all(checks)).every(Boolean)) return null;
    return Response.json({ error: "Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente." }, { status: 429, headers });
  } catch {
    return Response.json({ error: "Serviço temporariamente indisponível. Tente novamente em instantes." }, { status: 503, headers });
  }
}

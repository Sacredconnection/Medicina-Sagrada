import { config } from "@/lib/config";
import { limitRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = await limitRequest(request, "reports");
  if (limited) return limited;
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  const type = request.headers.get("content-type")?.split(";")[0];
  if (!["application/csp-report", "application/reports+json", "application/json"].includes(type ?? "")) {
    return new Response(null, { status: 415, headers });
  }
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400, headers });
  let size = 0, body = "";
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16_384) { await reader.cancel(); return new Response(null, { status: 413, headers }); }
    body += decoder.decode(value, { stream: true });
  }
  try {
    const data = JSON.parse(body + decoder.decode());
    const reports = Array.isArray(data) ? data.slice(0, 20).map(entry => entry?.body) : [data?.["csp-report"]];
    for (const report of reports) {
      if (!report || typeof report !== "object") continue;
      const documentUrl = report.documentURL ?? report["document-uri"];
      if (typeof documentUrl !== "string" || new URL(documentUrl).origin !== new URL(config.siteUrl).origin) continue;
      const directive = report.effectiveDirective ?? report["effective-directive"];
      const blocked = report.blockedURL ?? report["blocked-uri"];
      // Never log URL paths, queries, script samples, referrers, or credentials.
      const blockedOrigin = typeof blocked === "string" && /^https?:\/\//.test(blocked) ? new URL(blocked).origin : "inline-or-other";
      console.warn("csp-violation", { directive: typeof directive === "string" ? directive.replace(/[^a-z-]/g, "").slice(0, 60) : "unknown", blockedOrigin });
    }
    return new Response(null, { status: 204, headers });
  } catch { return new Response(null, { status: 400, headers }); }
}

import { NextResponse } from "next/server";
import { runContentDiagnostic } from "@/lib/diagnostics";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const result = await runContentDiagnostic();

  return NextResponse.json(result, {
    status: result.healthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

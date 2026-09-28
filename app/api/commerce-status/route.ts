import { NextResponse } from "next/server";
import { runCommerceDiagnostic } from "@/lib/commerce-diagnostics";

export const dynamic = "force-dynamic";
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const result = await runCommerceDiagnostic();
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}

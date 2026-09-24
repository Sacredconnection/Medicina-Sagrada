import { NextResponse } from "next/server";
import { runCommerceDiagnostic } from "@/lib/commerce-diagnostics";

export const dynamic = "force-dynamic";
export async function GET() {
  const result = await runCommerceDiagnostic();
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}

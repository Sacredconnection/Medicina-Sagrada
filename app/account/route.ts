import { NextResponse } from "next/server";
import { config } from "@/lib/config";

export function GET() {
  return NextResponse.redirect(config.wooAccountUrl, { status: 307, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}

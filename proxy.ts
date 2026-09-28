import { NextResponse } from "next/server";

export function proxy() {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Página não encontrada.", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/diagnostico-api/:path*",
};

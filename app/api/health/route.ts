// Cheap liveness check. Dependency readiness is checked by check:release, never
// by an unauthenticated endpoint that could amplify traffic against WordPress.
export function GET() {
  return Response.json({ status: "ok" }, {
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}

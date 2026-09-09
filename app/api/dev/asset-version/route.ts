import { stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 204 });
  }

  const assetPath = new URL(request.url).searchParams.get("path");
  if (!assetPath?.startsWith("/assets/")) {
    return NextResponse.json({ error: "Asset inválido." }, { status: 400 });
  }

  const publicRoot = path.resolve(process.cwd(), "public");
  const absolutePath = path.resolve(publicRoot, `.${assetPath}`);
  const assetsRoot = `${path.resolve(publicRoot, "assets")}${path.sep}`;

  if (!absolutePath.startsWith(assetsRoot)) {
    return NextResponse.json({ error: "Asset inválido." }, { status: 400 });
  }

  try {
    const file = await stat(absolutePath);

    return NextResponse.json(
      { version: `${Math.trunc(file.mtimeMs)}-${file.size}` },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json({ error: "Asset não encontrado." }, { status: 404 });
  }
}

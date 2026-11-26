import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { revalidationPath } from "@/lib/revalidation";

const safeEquals = (received: string, expected: string) => {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
};

export async function POST(request: Request) {
  const expectedSecret = process.env.REVALIDATION_SECRET;
  const receivedSecret = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");

  if (
    !expectedSecret ||
    !receivedSecret ||
    !safeEquals(receivedSecret, expectedSecret)
  ) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  let payload: unknown;
  try {
    const body = await request.text();
    if (body.length > 4096) return NextResponse.json({ revalidated: false }, { status: 413 });
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { revalidated: false, error: "JSON inválido." },
      { status: 400 },
    );
  }

  const path = revalidationPath(payload);
  if (!path) {
    return NextResponse.json(
      {
        revalidated: false,
        error: "Informe path ou a combinação type + slug.",
      },
      { status: 400 },
    );
  }

  revalidatePath(path);
  revalidatePath("/sitemap.xml");
  revalidateTag("wordpress", { expire: 0 });
  revalidateTag("woocommerce", { expire: 0 });

  return NextResponse.json({
    revalidated: true,
    path,
    timestamp: new Date().toISOString(),
  });
}

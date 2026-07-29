import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { ensureTrailingSlash } from "@/lib/url";

type RevalidationPayload = {
  type?: "page" | "post" | "product" | "product-category";
  slug?: string;
  path?: string;
};

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

  let payload: RevalidationPayload;
  try {
    payload = (await request.json()) as RevalidationPayload;
  } catch {
    return NextResponse.json(
      { revalidated: false, error: "JSON inválido." },
      { status: 400 },
    );
  }

  if (!payload.path && (!payload.type || !payload.slug)) {
    return NextResponse.json(
      {
        revalidated: false,
        error: "Informe path ou a combinação type + slug.",
      },
      { status: 400 },
    );
  }

  const path =
    payload.path ??
    (payload.type === "product"
      ? `/product/${payload.slug}/`
      : payload.type === "product-category"
        ? `/product-category/${payload.slug}/`
        : `/${payload.slug}/`);

  revalidatePath(ensureTrailingSlash(path!));
  revalidatePath("/sitemap.xml");
  revalidateTag("wordpress", "max");
  revalidateTag("woocommerce", "max");

  return NextResponse.json({
    revalidated: true,
    path: ensureTrailingSlash(path!),
    timestamp: new Date().toISOString(),
  });
}

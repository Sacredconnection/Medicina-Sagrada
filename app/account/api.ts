import "server-only";
import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

export const cookieName = "ms_customer_session";
export async function accountRequest(action: "login" | "profile" | "logout" | "save" | "register" | "recover", body: Record<string, string> = {}) {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Account API unavailable");
  const session = (await cookies()).get(cookieName)?.value;
  return fetch(config.wordpressApiUrl + "/ms-account/v1/" + action, {
    method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12000),
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + createHmac("sha256", secret).update("ms-account-v1").digest("hex") },
    body: JSON.stringify({ ...body, session }),
  });
}

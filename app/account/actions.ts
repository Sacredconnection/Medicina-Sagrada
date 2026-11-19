"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { accountRequest, cookieName } from "./api";

export async function login(form: FormData) {
  let error = "unavailable";
  try {
    const response = await accountRequest("login", { login: String(form.get("login") ?? ""), password: String(form.get("password") ?? ""), remember: form.has("remember") ? "1" : "0" });
    if (response.ok) {
      const { session } = await response.json();
      if (typeof session === "string" && /^[0-9a-f]{64}$/.test(session)) {
        (await cookies()).set(cookieName, session, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/account", ...(form.has("remember") ? { maxAge: 14 * 86400 } : {}) });
        error = "";
      }
    } else if (response.status === 401) error = "credentials";
    else if (response.status === 429) error = "limit";
  } catch { /* Display the service error on the account page. */ }
  redirect(error ? "/account/?error=" + error : "/account/");
}
export async function logout() {
  try { await accountRequest("logout"); }
  finally { (await cookies()).set(cookieName, "", { path: "/account", maxAge: 0 }); }
  redirect("/account/");
}

async function requestEmail(action: "register" | "recover", form: FormData) {
  let result = "error=unavailable";
  try {
    const response = await accountRequest(action, {
      identity: String(form.get("identity") ?? "").trim(),
      newsletter: form.has("newsletter") ? "1" : "0",
    });
    if (response.ok) result = "sent=" + action;
    if (response.status === 429) result = "error=limit";
  } catch { /* Display a retry message on the same page. */ }
  redirect("/account/?tab=" + action + "&" + result);
}
export async function register(form: FormData) { await requestEmail("register", form); }
export async function recover(form: FormData) { await requestEmail("recover", form); }

export async function saveAccount(form: FormData) {
  const section = String(form.get("section") ?? "");
  const tab = section === "details" ? "details" : "addresses";
  const body: Record<string, string> = { section };
  for (const key of ["name","email","password","new_password","first_name","last_name","company","address_1","address_2","city","state","postcode","country"]) {
    body[key] = String(form.get(key) ?? "");
  }
  let saved = false;
  try { saved = (await accountRequest("save", body)).ok; } catch { /* Show retry feedback. */ }
  redirect("/account/?tab=" + tab + "&saved=" + (saved ? "1" : "0"));
}

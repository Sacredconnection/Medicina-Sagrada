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

type SaveState = { ok: boolean; values: Record<string, string>; message: string };

export async function saveAccount(_previous: SaveState | null, form: FormData): Promise<SaveState> {
  const section = String(form.get("section") ?? "");
  const keys = section === "details" ? ["name", "email"] :
    ["first_name", "last_name", "company", "address_1", "address_2", "city", "state", "postcode", "country"];
  const values = Object.fromEntries(keys.map(key => [key, String(form.get(key) ?? "")]));
  const body: Record<string, string> = { section, ...values };
  if (section === "details") {
    body.password = String(form.get("password") ?? "");
    body.new_password = String(form.get("new_password") ?? "");
  }
  let message = "Não foi possível confirmar o salvamento. Tente novamente em instantes.";
  try {
    const response = await accountRequest("save", body);
    if (response.ok) return { ok: true, values, message: "Alterações salvas." };
    if (response.status === 401) message = "Sua sessão expirou. Entre novamente para salvar.";
    if (response.status === 429) message = "Aguarde alguns minutos antes de tentar salvar novamente.";
    if (response.status === 400) {
      const error = await response.json();
      if (error.message === "Confira a senha atual.") message = "Confira a senha atual e digite-a novamente.";
      else if (error.code === "short") message = "Digite uma nova senha com pelo menos 12 caracteres.";
      else message = section === "details" ? "Confira o nome de exibição e o e-mail." : "Confira a rua e o número, a cidade e a sigla do país.";
    }
  } catch { /* Keep the draft available for a retry. */ }
  if (body.new_password) message += " Para alterar a senha, preencha a nova senha novamente.";
  return { ok: false, values, message };
}

import { cookies } from "next/headers";
import { accountRequest, cookieName } from "./api";
import { login, logout } from "./actions";

export const metadata = { title: "Minha conta", robots: { index: false, follow: false } };
type Profile = { name: string; email: string; orders: { id: string; status: string; total: string }[] };
export default async function Account({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  let profile: Profile | undefined;
  let { error } = await searchParams;
  if ((await cookies()).has(cookieName)) {
    try {
      const response = await accountRequest("profile");
      if (response.ok) profile = await response.json();
      else error = response.status === 401 ? "expired" : "unavailable";
    } catch { error = "unavailable"; }
  }
  const messages: Record<string, string> = { credentials: "Confira seu usuário e sua senha.", expired: "Sua sessão expirou. Entre novamente.", limit: "Aguarde alguns minutos antes de tentar novamente.", unavailable: "O serviço da conta está indisponível. Tente novamente em instantes." };
  return <main className="container" style={{ paddingBlock: "3rem", maxWidth: "44rem" }}>
    <h1>Minha conta</h1>
    {error && messages[error] && <p role="alert">{messages[error]}</p>}
    {profile ? <>
      <p>{profile.name} · {profile.email}</p>
      <h2>Últimos pedidos</h2>
      {profile.orders.length ? <ul>{profile.orders.map(order => <li key={order.id}>Pedido #{order.id} · {order.status} · {order.total}</li>)}</ul> : <p>Você ainda não tem pedidos.</p>}
      <form action={logout}><button type="submit">Sair da conta</button></form>
    </> : <form action={login} style={{ display: "grid", gap: "1rem", maxWidth: "26rem" }}>
      <label>E-mail ou usuário<input name="login" autoComplete="username" required /></label>
      <label>Senha<input type="password" name="password" autoComplete="current-password" required /></label>
      <button type="submit">Entrar</button>
    </form>}
  </main>;
}

import styles from "./account.module.css";
import { cookies } from "next/headers";
import { accountRequest, cookieName } from "./api";
import { login, logout, register, recover } from "./actions";

export const metadata = { title: "Minha conta", robots: { index: false, follow: false } };
type Profile = { name: string; email: string; orders: { id: string; status: string; total: string }[] };
export default async function Account({ searchParams }: { searchParams: Promise<{ error?: string; tab?: string; sent?: string }> }) {
  let profile: Profile | undefined;
  let { error, tab, sent } = await searchParams;
  if ((await cookies()).has(cookieName)) {
    try {
      const response = await accountRequest("profile");
      if (response.ok) profile = await response.json();
      else error = response.status === 401 ? "expired" : "unavailable";
    } catch { error = "unavailable"; }
  }
  const messages: Record<string, string> = { credentials: "Confira seu usuário e sua senha.", expired: "Sua sessão expirou. Entre novamente.", limit: "Aguarde alguns minutos antes de tentar novamente.", unavailable: "O serviço da conta está indisponível. Tente novamente em instantes." };
  return <main className={styles.page}>
    <header className={styles.header}>
      <h1>Minha conta</h1>
      {profile && <form action={logout}><button className={styles.exit}>Sair da conta</button></form>}
    </header>
    {profile ? <>
      <div className={styles.identity}><strong>{profile.name}</strong><span>{profile.email}</span></div>
      <section className={styles.panel} aria-labelledby="orders-title">
        <h2 id="orders-title">Últimos pedidos</h2>
        {profile.orders.length ? <table>
          <thead><tr><th scope="col">Pedido</th><th scope="col">Situação</th><th scope="col">Total</th></tr></thead>
          <tbody>{profile.orders.map(order => <tr key={order.id}>
            <th scope="row">#{order.id}</th><td><span className={styles.status}>{order.status}</span></td><td>{order.total}</td>
          </tr>)}</tbody>
        </table> : <p>Você ainda não tem pedidos.</p>}
      </section>
    </> : <div className={styles.login}>
      <nav aria-label="Acesso à conta" className={styles.tabs}>
        <a href="/account/" aria-current={tab !== "register" ? "page" : undefined}>Entrar</a>
        <a href="/account/?tab=register" aria-current={tab === "register" ? "page" : undefined}>Cadastre-se</a>
      </nav>
      {error && messages[error] && <p role="alert">{messages[error]}</p>}
      {sent === tab && sent && <p role="status">Confira seu e-mail. Se sua solicitação for aplicável, você receberá um link para definir sua senha.</p>}
      {tab === "register" ? <form action={register}>
        <label>Endereço de e-mail<input name="identity" type="email" autoComplete="email" maxLength={254} required /></label>
        <p>Enviaremos um link por e-mail para você definir sua senha.</p>
        <label className={styles.check}><input name="newsletter" type="checkbox" />Assinar nossa newsletter</label>
        <a href="/politica-de-privacidade/">Política de privacidade</a>
        <button>Cadastre-se</button>
      </form> : tab === "recover" ? <form action={recover}>
        <h2>Recuperar senha</h2>
        <label>Nome de usuário ou e-mail<input name="identity" autoComplete="username" required /></label>
        <button>Enviar link de recuperação</button>
      </form> : <form action={login}>
        <label>Nome de usuário ou e-mail<input name="login" autoComplete="username" required /></label>
        <label>Senha<input type="password" name="password" autoComplete="current-password" required /></label>
        <label className={styles.check}><input name="remember" type="checkbox" />Lembre-me</label>
        <button>Acessar</button>
        <a href="/account/?tab=recover">Perdeu sua senha?</a>
      </form>}
    </div>}
  </main>;
}

import { CustomerArea, type AccountProfile } from "./customer-area";
import styles from "./account.module.css";
import { cookies } from "next/headers";
import { accountRequest, cookieName } from "./api";
import { login, logout, register, recover } from "./actions";

export const metadata = { title: "Minha conta", robots: { index: false, follow: false } };
export default async function Account({ searchParams }: { searchParams: Promise<{ error?: string; tab?: string; sent?: string; saved?: string; order?: string }> }) {
  let profile: AccountProfile | undefined;
  let { error, tab, sent, saved, order } = await searchParams;
  if ((await cookies()).has(cookieName)) {
    try {
      const response = await accountRequest("profile", typeof order === "string" ? { order } : {});
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
    {profile ? <CustomerArea profile={profile} tab={tab} saved={saved} order={order} /> : <div className={styles.login}>
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

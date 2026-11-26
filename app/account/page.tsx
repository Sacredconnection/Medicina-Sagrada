import { CustomerArea, type AccountProfile } from "./customer-area";
import styles from "./account.module.css";
import { cookies } from "next/headers";
import Link from "next/link";
import { accountRequest, cookieName } from "./api";
import { login, logout, register, recover } from "./actions";

export const metadata = { title: "Minha conta", robots: { index: false, follow: false } };
export default async function Account({ searchParams }: { searchParams: Promise<{ error?: string; tab?: string; sent?: string; saved?: string; order?: string }> }) {
  let profile: AccountProfile | undefined;
  const { error: queryError, tab, sent, saved, order } = await searchParams;
  let error = queryError;
  if ((await cookies()).has(cookieName)) {
    try {
      const response = await accountRequest("profile", typeof order === "string" ? { order } : {});
      if (response.ok) profile = await response.json();
      else error = response.status === 401 ? "expired" : "unavailable";
    } catch { error = "unavailable"; }
  }
  const messages: Record<string, string> = { credentials: "Confira seu usuário e sua senha.", expired: "Sua sessão expirou. Entre novamente.", limit: "Aguarde alguns minutos antes de tentar novamente.", unavailable: "O serviço da conta está indisponível. Tente novamente em instantes." };
  return <div className={profile ? styles.page : `${styles.page} ${styles.accessPage}`}>
    <header className={styles.header}>
      <h1>{!profile && tab === "recover" ? "Recuperar senha" : "Minha conta"}</h1>
      {profile && <form action={logout}><button className={styles.exit}>Sair da conta</button></form>}
    </header>
    {profile ? <CustomerArea profile={profile} tab={tab} saved={saved} order={order} /> : <div className={styles.login}>
      {tab !== "recover" && <nav aria-label="Acesso à conta" className={styles.tabs}>
        <Link href="/account/" aria-current={tab !== "register" ? "page" : undefined}>Entrar</Link>
        <Link href="/account/?tab=register" aria-current={tab === "register" ? "page" : undefined}>Criar conta</Link>
      </nav>}
      {error && messages[error] && <p role="alert">{messages[error]}</p>}
      {sent === tab && sent && <p role="status">Confira seu e-mail. Se sua solicitação for aplicável, você receberá um link para definir sua senha.</p>}
      {tab === "register" ? <form action={register}>
        <label>Endereço de e-mail<input name="identity" type="email" autoComplete="email" maxLength={254} required /></label>
        <p>Enviaremos um link por e-mail para você definir sua senha.</p>
        <label className={styles.check}><input name="newsletter" type="checkbox" />Assinar nossa newsletter</label>
        <Link href="/politica-de-privacidade/">Política de privacidade</Link>
        <button>Criar conta</button>
      </form> : tab === "recover" ? <form action={recover}>
        <p>Informe o usuário ou e-mail cadastrado para receber o link de recuperação.</p>
        <label>Nome de usuário ou e-mail<input name="identity" autoComplete="username" required /></label>
        <button>Enviar link de recuperação</button>
        <Link className={styles.backLink} href="/account/">Voltar para entrar</Link>
      </form> : <form action={login}>
        <label>Nome de usuário ou e-mail<input name="login" autoComplete="username" required /></label>
        <label>Senha<input type="password" name="password" autoComplete="current-password" required /></label>
        <div className={styles.loginOptions}>
          <label className={styles.check}><input name="remember" type="checkbox" />Lembre-me</label>
          <Link href="/account/?tab=recover">Esqueci minha senha</Link>
        </div>
        <button>Entrar</button>
      </form>}
    </div>}
  </div>;
}

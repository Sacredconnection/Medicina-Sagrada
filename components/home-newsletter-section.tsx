import Link from "next/link";

export function HomeNewsletterSection() {
  return (
    <section className="newsletter-section" id="newsletter" aria-labelledby="newsletter-title">
      <div className="container newsletter-layout">
        <div className="newsletter-copy">
          <h2 id="newsletter-title">Histórias, <span>saberes</span> e <span>ofertas</span> no seu e-mail.</h2>
          <p>
            Receba por e-mail histórias e conhecimentos dos povos da
            floresta, promoções, descontos e novidades da Medicina Sagrada.
          </p>
        </div>

        <form
          className="newsletter-form"
          action="https://Medicinasagrada.us20.list-manage.com/subscribe/post?u=8133cf0f875cf89c2f7dba9ea&id=0641d6c8e3&f_id=00b51deff0"
          method="post"
          target="_blank"
          rel="noopener"
          aria-label="Receba novidades por e-mail"
        >
          <label className="newsletter-email-label" htmlFor="newsletter-email">Seu e-mail</label>
          <div className="newsletter-input-row">
            <input
              id="newsletter-email"
              name="EMAIL"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={254}
              placeholder="voce@exemplo.com"
              required
            />
          </div>

          <label className="newsletter-consent">
            <input type="checkbox" required />
            <span>Quero receber novidades e promoções da Medicina Sagrada por e-mail.</span>
          </label>

          <button className="button newsletter-submit" type="submit">
            Quero receber
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
          </button>

          <p className="newsletter-privacy">
            Você pode cancelar o recebimento a qualquer momento. Consulte nossa{" "}
            <Link href="/politica-de-privacidade/">Política de Privacidade</Link>.
          </p>

          <label hidden aria-hidden="true">
            Website
            <input name="b_8133cf0f875cf89c2f7dba9ea_0641d6c8e3" tabIndex={-1} autoComplete="off" />
          </label>

        </form>
      </div>
    </section>
  );
}

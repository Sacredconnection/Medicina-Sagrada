"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

type NewsletterResponse = {
  status?: "received";
  error?: string;
};

const unavailableMessage =
  "O cadastro está temporariamente indisponível. Tente novamente mais tarde.";

export function HomeNewsletterSection({
  endpoint = "/api/newsletter/",
}: {
  endpoint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const form = event.currentTarget;
    const values = new FormData(form);
    submitting.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(values.get("email") ?? "").trim(),
          consent: values.get("consent") === "on",
          website: String(values.get("website") ?? ""),
        }),
        signal: AbortSignal.timeout(15000),
      });
      const result: NewsletterResponse | null = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          (response.status === 400 || response.status === 429) && typeof result?.error === "string"
            ? result.error
            : unavailableMessage,
        );
      }

      if (result?.status !== "received") {
        throw new Error(unavailableMessage);
      }

      setMessage(String(values.get("email")).trim());
      form.reset();
    } catch (failure) {
      setError(
        failure instanceof Error && failure.name === "Error"
          ? failure.message
          : "Não foi possível confirmar seu cadastro. Tente novamente em instantes.",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="newsletter-section" style={{ borderTop: "2px solid #cad6c9", backgroundColor: "#f6f8f3" }} id="newsletter" aria-labelledby="newsletter-title">
      <div className="container newsletter-layout">
        <div className="newsletter-copy">
          <h2 id="newsletter-title">Histórias, <span>saberes</span> e <span>ofertas</span> no seu e-mail.</h2>
          <p>
            Receba por e-mail histórias e conhecimentos dos povos da
            floresta, promoções, descontos e novidades da Medicina Sagrada.
          </p>
        </div>

        {message ? (
          <div tabIndex={-1} ref={node => { node?.focus({ preventScroll: true }); }} aria-labelledby="newsletter-success-title" aria-describedby="newsletter-success-detail" style={{ background: "#edf5ef", color: "#173c29", borderLeft: "4px solid #346849", borderRadius: ".5rem", padding: "1.5rem", overflowWrap: "anywhere" }}>
            <h3 id="newsletter-success-title"><span aria-hidden="true">✓ </span>Inscrição recebida!</h3>
            <p id="newsletter-success-detail">Você cadastrou o e-mail <strong>{message}</strong>. Se receber uma mensagem de confirmação, clique no link para concluir.</p>
          </div>
        ) : <form
          className="newsletter-form"
          method="post"
          onSubmit={submit}
          aria-label="Receba novidades por e-mail"
          aria-busy={busy}
        >
          <label className="newsletter-email-label" htmlFor="newsletter-email">Seu e-mail</label>
          <div className="newsletter-input-row">
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={254}
              placeholder="voce@exemplo.com"
              disabled={busy}
              required
            />
          </div>

          <label className="newsletter-consent">
            <input name="consent" type="checkbox" disabled={busy} required />
            <span>Quero receber novidades e promoções da Medicina Sagrada por e-mail.</span>
          </label>

          <button className="button newsletter-submit" type="submit" disabled={busy}>
            {busy ? "Cadastrando…" : "Quero receber"}
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
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>

          {error ? <p className="newsletter-feedback commerce-error" role="alert">{error}</p> : null}
        </form>}
      </div>
    </section>
  );
}

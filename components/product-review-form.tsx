"use client";

import { useRef, useState, type FormEvent } from "react";

export function ProductReviewForm({ productId }: { productId: number }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    submitting.current = true; setBusy(true); setError("");
    try {
      const response = await fetch("/api/reviews/", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating: Number(values.get("rating")), comment: values.get("comment"), username: values.get("username"), password: values.get("password"), website: values.get("website") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar sua avaliação.");
      setMessage(result.message); form.reset(); setRating(0); setHoverRating(0);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível confirmar o envio. Confira suas avaliações antes de tentar novamente.");
    } finally {
      const password = form.elements.namedItem("password");
      if (password instanceof HTMLInputElement) password.value = "";
      submitting.current = false; setBusy(false);
    }
  }

  return <div className="review-compose">
    {message ? <div className="review-form"><h3>Obrigado por compartilhar</h3><p role="status">{message}</p></div> :
      <form id="product-review-form" className="review-form" onSubmit={submit} aria-busy={busy}>
        <h3>Compartilhe sua experiência</h3>
        <p className="review-form-intro">Sua opinião ajuda outras pessoas a escolher com mais confiança.</p>
        <fieldset className="review-form-fields" disabled={busy}>
          <legend className="sr-only">Dados da avaliação</legend>
          <fieldset className="review-rating">
            <legend>Sua nota</legend>
            <div className="review-rating-options" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map(value => <label key={value} className="review-rating-option" data-active={value <= (hoverRating || rating)} onMouseEnter={() => setHoverRating(value)}>
                <input type="radio" name="rating" value={value} required checked={rating === value} onChange={() => setRating(value)} aria-label={`${value} ${value === 1 ? "estrela" : "estrelas"}`} />
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m12 2.5 2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.32l-5.8 3.05 1.11-6.47-4.7-4.58 6.49-.94Z" /></svg>
              </label>)}
            </div>
            <span className="review-rating-caption" aria-live="polite">{rating ? `${rating} de 5 estrelas` : "Selecione de 1 a 5 estrelas"}</span>
          </fieldset>
          <label className="commerce-field">Sua avaliação<textarea name="comment" required maxLength={3000} rows={5} /></label>
          <div className="review-account">
            <p>Para enviar, use sua conta da loja. Sua senha não será salva neste site.</p>
            <div className="review-account-fields">
              <label className="commerce-field">E-mail ou usuário<input name="username" autoComplete="username" required maxLength={254} autoCapitalize="none" spellCheck={false} /></label>
              <label className="commerce-field">Senha da conta<input name="password" type="password" autoComplete="current-password" required maxLength={256} /></label>
            </div>
          </div>
          <label hidden aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <div className="review-form-footer">
            <p>Seu e-mail não será exibido. Sua avaliação poderá passar por moderação antes de ser publicada.</p>
            <button className="commerce-button" type="submit">{busy ? "Enviando avaliação…" : "Enviar avaliação"}</button>
          </div>
        </fieldset>
        {error ? <p className="commerce-error" role="alert">{error}</p> : null}
      </form>}
  </div>;
}

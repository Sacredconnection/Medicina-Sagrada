"use client";

import { useRef, useState, type FormEvent } from "react";

export function ProductReviewForm({ productId }: { productId: number }) {
  const [open, setOpen] = useState(false);
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
      setMessage(result.message); form.reset(); setOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível confirmar o envio. Confira suas avaliações antes de tentar novamente.");
    } finally {
      const password = form.elements.namedItem("password");
      if (password instanceof HTMLInputElement) password.value = "";
      submitting.current = false; setBusy(false);
    }
  }

  return <div className="review-compose">
    {message ? <p role="status">{message}</p> : <>
      <button type="button" className="commerce-button" aria-expanded={open} aria-controls="product-review-form" onClick={() => setOpen(!open)} disabled={busy}>{open ? "Fechar formulário" : "Escrever uma avaliação"}</button>
      {open ? <form id="product-review-form" className="review-form" onSubmit={submit} aria-busy={busy}>
        <h3>Sua experiência com este produto</h3>
        <fieldset disabled={busy}>
          <legend className="sr-only">Dados da avaliação</legend>
          <label className="commerce-field">Sua nota<select name="rating" required defaultValue=""><option value="" disabled>Selecione uma nota</option>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} {value === 1 ? "estrela" : "estrelas"}</option>)}</select></label>
          <label className="commerce-field">Sua avaliação<textarea name="comment" required maxLength={3000} rows={5} /></label>
          <p>A loja exige uma conta para avaliar. Use seus dados de acesso; sua senha não será salva neste site.</p>
          <label className="commerce-field">E-mail ou usuário<input name="username" autoComplete="username" required maxLength={254} autoCapitalize="none" /></label>
          <label className="commerce-field">Senha da conta<input name="password" type="password" autoComplete="current-password" required maxLength={256} /></label>
          <label hidden aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <p>Sua avaliação poderá passar por moderação antes de ser publicada.</p>
          <button className="commerce-button" type="submit">{busy ? "Enviando avaliação…" : "Enviar avaliação"}</button>
        </fieldset>
        {error ? <p className="commerce-error" role="alert">{error}</p> : null}
      </form> : null}
    </>}
  </div>;
}

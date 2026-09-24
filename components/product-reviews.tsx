"use client";

import { useState } from "react";
import type { ProductReview } from "@/lib/reviews";

export function ProductReviews({ productId, count, average, initial, initialError, reviewUrl }: { productId: number; count: number; average: string; initial: { data: ProductReview[]; totalPages: number }; initialError: boolean; reviewUrl: string }) {
  const [reviews, setReviews] = useState(initial.data);
  const [page, setPage] = useState(initialError ? 0 : 1);
  const [totalPages, setTotalPages] = useState(initial.totalPages);
  const [error, setError] = useState(initialError ? "Não foi possível carregar as avaliações." : "");
  const [busy, setBusy] = useState(false);
  async function more() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/reviews/?product=${productId}&page=${page + 1}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setReviews(current => [...current, ...result.data].filter((review, index, all) => all.findIndex(item => item.id === review.id) === index)); setTotalPages(result.totalPages); setPage(page + 1);
    } catch { setError("Não foi possível carregar as avaliações. Tente novamente."); }
    finally { setBusy(false); }
  }
  return <section id="avaliacoes" className="product-reviews" aria-labelledby="reviews-title">
    <div className="reviews-heading"><div><p className="eyebrow">Quem já escolheu</p><h2 id="reviews-title">Avaliações de clientes</h2><p>{count ? `${Number(average).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} de 5 · ${count} ${count === 1 ? "avaliação" : "avaliações"}` : "Este produto ainda não recebeu avaliações."}</p></div>
      <div className="review-invitation"><a className="commerce-button" href={reviewUrl}>Escrever uma avaliação</a><p>Você continuará na loja para entrar na sua conta e enviar sua avaliação. Seu comentário poderá passar por moderação antes de aparecer aqui.</p></div>
    </div>
    <div className="review-list" aria-busy={busy}>{reviews.map(review => <article key={review.id} className="review"><header><strong>{review.reviewer}</strong>{review.verified ? <span className="verified-review">Compra verificada</span> : null}<time dateTime={`${review.date}Z`}>{new Date(`${review.date}Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</time></header><p className="review-stars" aria-label={`${review.rating} de 5 estrelas`}>{"★".repeat(Math.max(0, Math.min(5, Math.round(review.rating))))}<span aria-hidden="true">{"☆".repeat(Math.max(0, 5 - Math.round(review.rating)))}</span></p><p className="review-text">{review.review}</p></article>)}</div>
    {error ? <p className="commerce-error" role="alert">{error}</p> : null}
    {error || page < totalPages ? <button className="commerce-text-button" disabled={busy} onClick={() => void more()}>{busy ? "Carregando…" : error ? "Tentar novamente" : "Carregar mais avaliações"}</button> : null}
  </section>;
}

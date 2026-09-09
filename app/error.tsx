"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="empty-state container">
      <p className="eyebrow">Conteúdo indisponível</p>
      <h1>Não foi possível carregar esta página.</h1>
      <p>Tente novamente em instantes.</p>
      <button className="button" type="button" onClick={reset}>
        Tentar novamente
      </button>
    </section>
  );
}

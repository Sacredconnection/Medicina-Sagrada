"use client";

import { useTransition } from "react";

export default function BlogError({ retry }: { retry: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <section aria-label="Artigos do blog" aria-busy={isPending}>
      <p role="status">
        {isPending
          ? "Buscando os artigos…"
          : "Os artigos estão temporariamente indisponíveis. Tente novamente em instantes."}
      </p>
      <button
        className="button"
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => retry())}
      >
        {isPending ? "Carregando…" : "Tentar novamente"}
      </button>
    </section>
  );
}

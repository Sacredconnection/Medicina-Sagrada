"use client";

import { useEffect, useId, useRef, useState } from "react";
import { parseShippingInput, type ShippingEstimate } from "@/lib/shipping-validation";

export function ShippingCalculator({ productId, quantity, available }: { productId?: number; quantity: number; available: boolean }) {
  const id = useId();
  const [postcode, setPostcode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ key: string; data?: ShippingEstimate; error?: string } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const key = `${productId}:${quantity}:${postcode}`;
  const current = result?.key === key ? result : null;
  useEffect(() => () => controller.current?.abort(), []);

  return <section className="shipping-calculator" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>Calcule o frete e o prazo</h2>
    <form onSubmit={async (event) => {
      event.preventDefault();
      if (busy) return;
      setResult(null);
      let input;
      try { input = parseShippingInput({ productId, quantity, postcode }); }
      catch (error) { setResult({ key, error: error instanceof Error ? error.message : "Confira o CEP." }); return; }
      controller.current?.abort();
      const request = new AbortController(); controller.current = request;
      setBusy(true);
      try {
        const response = await fetch("/api/shipping/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal: request.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível consultar o frete.");
        setResult({ key, data });
      } catch (error) { if (!request.signal.aborted) setResult({ key, error: error instanceof Error ? error.message : "Não foi possível consultar o frete." }); }
      finally { if (!request.signal.aborted) setBusy(false); }
    }}>
      <label htmlFor={`${id}-cep`}>CEP de entrega</label>
      <div className="shipping-input-row">
        <input id={`${id}-cep`} name="postcode" inputMode="numeric" autoComplete="postal-code" maxLength={9} placeholder="00000-000" value={postcode} aria-describedby={`${id}-help`} onChange={(event) => { setPostcode(event.target.value.replace(/\D/g, "").slice(0,8).replace(/^(\d{5})(\d)/, "$1-$2")); setResult(null); }} />
        <button className="commerce-button" type="submit" disabled={busy || !productId || !available}>{busy ? "Calculando…" : "Calcular"}</button>
      </div>
      <p id={`${id}-help`} className="shipping-help">{!productId ? "Selecione uma opção do produto para consultar." : "Para este produto e a quantidade selecionada."}</p>
    </form>
    <div aria-live="polite" aria-busy={busy}>
      {current?.error ? <p className="commerce-error" role="alert">{current.error}</p> : null}
      {current?.data ? <>
        <p className="shipping-destination">Entrega para {postcode}</p>
        {current.data.quotes.length ? <ul className="shipping-results">{current.data.quotes.map((quote, index) => <li key={`${quote.name}-${index}`}>
          <div><strong>{quote.name}</strong><span>{quote.deliveryTime || "Prazo informado na finalização"}</span>{quote.observations ? <small>{quote.observations}</small> : null}</div><strong>{quote.price}</strong>
        </li>)}</ul> : <p>Nenhuma opção retornada para este CEP. Confira o endereço ou consulte na finalização.</p>}
        <p className="shipping-help">Estimativa de entrega após a postagem. Valor e prazo serão confirmados com o endereço completo e todos os itens na finalização.</p>
      </> : null}
    </div>
  </section>;
}

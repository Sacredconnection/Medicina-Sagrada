import type { Metadata } from "next";
import Link from "next/link";
import { plainText } from "@/lib/html";
import { runContentDiagnostic } from "@/lib/diagnostics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Diagnóstico das APIs",
  robots: { index: false, follow: false },
};

export default async function DiagnosticPage() {
  const diagnostic = await runContentDiagnostic();
  const checks = [
    { name: "WordPress REST API", result: diagnostic.wordpress },
    { name: "WooCommerce Store API", result: diagnostic.woocommerce },
  ];

  return (
    <section className="container content-page diagnostic-page">
      <p className="eyebrow">Ambiente técnico</p>
      <h1>Diagnóstico das APIs</h1>
      <p className="diagnostic-intro">
        Teste executado no servidor em{" "}
        {new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "medium",
          timeZone: "America/Sao_Paulo",
        }).format(new Date(diagnostic.checkedAt))}
        .
      </p>

      <div className="diagnostic-grid">
        {checks.map(({ name, result }) => (
          <article className="diagnostic-card" key={name}>
            <div className="diagnostic-card-header">
              <h2>{name}</h2>
              <span
                className={`status ${result.ok ? "status-ok" : "status-error"}`}
              >
                {result.ok ? "Conectada" : "Falhou"}
              </span>
            </div>
            <dl>
              <div>
                <dt>Status HTTP</dt>
                <dd>{result.status ?? "sem resposta"}</dd>
              </div>
              <div>
                <dt>Tempo</dt>
                <dd>{result.durationMs} ms</dd>
              </div>
              <div>
                <dt>Endpoint</dt>
                <dd>
                  <code>{result.endpoint}</code>
                </dd>
              </div>
            </dl>
            <p>{result.message}</p>
            {"sample" in result && result.sample ? (
              <div className="diagnostic-sample">
                <p className="eyebrow">Amostra recuperada</p>
                <strong>
                  {plainText(
                    "title" in result.sample
                      ? result.sample.title
                      : result.sample.name,
                  )}
                </strong>
                <code>{result.sample.slug}</code>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <p className="diagnostic-footer">
        Resposta JSON: <Link href="/api/diagnostico/">/api/diagnostico/</Link>
      </p>
    </section>
  );
}

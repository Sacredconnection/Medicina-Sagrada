export type DiagnosticCheck = {
  ok: boolean;
  endpoint: string;
  status: number | null;
  durationMs: number;
  message: string;
};

export async function diagnosticRequest<T>(
  url: string,
  endpoint: string,
  validate: (data: unknown, response: Response) => data is T,
): Promise<{ check: DiagnosticCheck; data: T | null }> {
  const startedAt = performance.now();
  let status: number | null = null;
  const result = (ok: boolean, message: string, data: T | null = null) => ({
    check: { ok, endpoint, status, durationMs: Math.round(performance.now() - startedAt), message },
    data,
  });

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "Cache-Control": "no-store" },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000),
    });
    status = response.status;
    if (!response.ok) return result(false, `A API respondeu com o status ${status}.`);
    const data: unknown = await response.json();
    if (!validate(data, response)) return result(false, "A API não retornou os dados esperados ou respondeu com uma sessão em cache.");
    return result(true, "Conexão confirmada.", data);
  } catch (error) {
    const failure = error as { name?: string; cause?: { code?: string } };
    const timedOut = failure.name === "TimeoutError" || failure.cause?.code === "UND_ERR_CONNECT_TIMEOUT";
    return result(false, timedOut
      ? "A conexão excedeu o limite de 10 segundos. Verifique a hospedagem e o acesso à API."
      : status !== null
        ? "A API não retornou um JSON válido ou a leitura da resposta foi interrompida."
        : "Não foi possível conectar à API. Verifique a hospedagem, a rede e a URL configurada.");
  }
}

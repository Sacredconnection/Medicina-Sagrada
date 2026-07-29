import { config } from "@/lib/config";
import type { WooProduct, WordPressContent } from "@/lib/types";

type CheckResult = {
  ok: boolean;
  endpoint: string;
  status: number | null;
  durationMs: number;
  message: string;
};

export type ContentDiagnostic = {
  checkedAt: string;
  healthy: boolean;
  wordpress: CheckResult & {
    sample?: { id: number; slug: string; title: string };
  };
  woocommerce: CheckResult & {
    sample?: { id: number; slug: string; name: string };
  };
};

const timedFetch = async <T>(url: URL) => {
  const startedAt = performance.now();
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const durationMs = Math.round(performance.now() - startedAt);

  if (!response.ok) {
    throw Object.assign(
      new Error(`A API respondeu com o status ${response.status}.`),
      { status: response.status, durationMs },
    );
  }

  return {
    data: (await response.json()) as T,
    status: response.status,
    durationMs,
  };
};

const failedCheck = (
  endpoint: string,
  error: unknown,
): CheckResult => {
  const failure = error as { message?: string; status?: number; durationMs?: number };
  return {
    ok: false,
    endpoint,
    status: failure.status ?? null,
    durationMs: failure.durationMs ?? 0,
    message: failure.message ?? "Falha desconhecida.",
  };
};

export async function runContentDiagnostic(): Promise<ContentDiagnostic> {
  const wordpressEndpoint = `${config.wordpressApiUrl}/wp/v2/pages`;
  const wooEndpoint = `${config.wooStoreApiUrl}/products`;

  const [wordpress, woocommerce] = await Promise.all([
    timedFetch<WordPressContent[]>(
      new URL(`${wordpressEndpoint}?per_page=1&status=publish`),
    )
      .then(({ data, status, durationMs }) => ({
        ok: true,
        endpoint: "/wp-json/wp/v2/pages",
        status,
        durationMs,
        message: `${data.length} página de amostra recuperada.`,
        sample: data[0]
          ? {
              id: data[0].id,
              slug: data[0].slug,
              title: data[0].title.rendered,
            }
          : undefined,
      }))
      .catch((error: unknown) =>
        failedCheck("/wp-json/wp/v2/pages", error),
      ),
    timedFetch<WooProduct[]>(
      new URL(`${wooEndpoint}?per_page=1&status=publish`),
    )
      .then(({ data, status, durationMs }) => ({
        ok: true,
        endpoint: "/wp-json/wc/store/v1/products",
        status,
        durationMs,
        message: `${data.length} produto de amostra recuperado.`,
        sample: data[0]
          ? {
              id: data[0].id,
              slug: data[0].slug,
              name: data[0].name,
            }
          : undefined,
      }))
      .catch((error: unknown) =>
        failedCheck("/wp-json/wc/store/v1/products", error),
      ),
  ]);

  return {
    checkedAt: new Date().toISOString(),
    healthy: wordpress.ok && woocommerce.ok,
    wordpress,
    woocommerce,
  };
}

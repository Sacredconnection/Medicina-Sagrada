import { config } from "@/lib/config";

type QueryValue = string | number | boolean | undefined;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

const buildUrl = (
  origin: string,
  path: string,
  query: Record<string, QueryValue> = {},
) => {
  const url = new URL(`${origin}/${path.replace(/^\/+/, "")}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });
  return url;
};

async function apiFetch<T>(
  origin: string,
  path: string,
  query: Record<string, QueryValue>,
  tags: string[],
): Promise<{ data: T; total: number; totalPages: number }> {
  const response = await fetch(buildUrl(origin, path, query), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
    next: { revalidate: config.contentRevalidate, tags },
  });

  if (!response.ok) {
    throw new ApiError(
      `A API respondeu ${response.status} para ${path}.`,
      response.status,
    );
  }

  return { data: (await response.json()) as T, total: Number(response.headers.get("X-WP-Total") ?? 0), totalPages: Number(response.headers.get("X-WP-TotalPages") ?? 0) };
}

export const wpFetch = <T>(
  path: string,
  query: Record<string, QueryValue> = {},
  tags: string[] = ["wordpress"],
) => apiFetch<T>(config.wordpressApiUrl, path, query, tags).then(result => result.data);

export const wooFetch = <T>(
  path: string,
  query: Record<string, QueryValue> = {},
  tags: string[] = ["woocommerce"],
) => apiFetch<T>(config.wooStoreApiUrl, path, query, tags).then(result => result.data);

export const wooCollection = <T>(path: string, query: Record<string, QueryValue> = {}, tags: string[] = ["woocommerce"]) =>
  apiFetch<T[]>(config.wooStoreApiUrl, path, query, tags);

export const wpCollection = <T>(path: string, query: Record<string, QueryValue> = {}, tags: string[] = ["wordpress"]) =>
  apiFetch<T[]>(config.wordpressApiUrl, path, query, tags);

export async function fetchAll<T>(
  fetchPage: (page: number) => Promise<T[]>,
  maximumPages = 50,
) {
  const items: T[] = [];
  for (let page = 1; page <= maximumPages; page += 1) {
    const result = await fetchPage(page);
    items.push(...result);
    if (result.length < 100) break;
  }
  return items;
}

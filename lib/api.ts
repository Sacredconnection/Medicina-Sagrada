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
): Promise<T> {
  const response = await fetch(buildUrl(origin, path, query), {
    headers: { Accept: "application/json" },
    next: { revalidate: config.contentRevalidate, tags },
  });

  if (!response.ok) {
    throw new ApiError(
      `A API respondeu ${response.status} para ${path}.`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export const wpFetch = <T>(
  path: string,
  query: Record<string, QueryValue> = {},
  tags: string[] = ["wordpress"],
) => apiFetch<T>(config.wordpressApiUrl, path, query, tags);

export const wooFetch = <T>(
  path: string,
  query: Record<string, QueryValue> = {},
  tags: string[] = ["woocommerce"],
) => apiFetch<T>(config.wooStoreApiUrl, path, query, tags);

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

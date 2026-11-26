export function revalidationPath(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const { path, type, slug } = payload as Record<string, unknown>;
  let result: string;
  if (typeof path === "string") result = path;
  else {
    if (typeof slug !== "string" || !slug || !["page", "post", "product", "product-category"].includes(String(type))) return null;
    result = `${type === "product" ? "/product/" : type === "product-category" ? "/product-category/" : "/"}${slug}`;
  }
  if (result.length > 1024 || !result.startsWith("/") || /[\\?#%\s\[\]]/.test(result) || result.includes("//") || result.split("/").some(part => part === "." || part === "..") || /^\/(?:api|_next)(?:\/|$)/.test(result)) return null;
  return result.endsWith("/") ? result : `${result}/`;
}

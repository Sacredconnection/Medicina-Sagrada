export function parseTagArchive(segments: string[], kind: "tag" | "product-tag") {
  if (!segments[0] || !/^[^/\\?#]+$/.test(segments[0])) return null;
  if (segments.length !== 1 && (segments.length !== 3 || segments[1] !== "page" || !/^[1-9]\d*$/.test(segments[2]))) return null;
  const page = segments.length === 3 ? Number(segments[2]) : 1;
  if (!Number.isSafeInteger(page)) return null;
  const basePath = `/${kind}/${segments[0]}/`;
  return { slug: segments[0], page, basePath, pathname: page === 1 ? basePath : `${basePath}page/${page}/` };
}

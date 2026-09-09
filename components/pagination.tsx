import Link from "next/link";

export function Pagination({
  page,
  hasNextPage,
  basePath,
}: {
  page: number;
  hasNextPage: boolean;
  basePath: string;
}) {
  if (page === 1 && !hasNextPage) return null;

  const pageHref = (value: number) =>
    value === 1
      ? `${basePath.replace(/\/+$/, "")}/`
      : `${basePath.replace(/\/+$/, "")}/page/${value}/`;

  return (
    <nav className="pagination" aria-label="Paginação">
      {page > 1 ? <Link href={pageHref(page - 1)}>Página anterior</Link> : <span />}
      <span aria-current="page">Página {page}</span>
      {hasNextPage ? (
        <Link href={pageHref(page + 1)}>Próxima página</Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

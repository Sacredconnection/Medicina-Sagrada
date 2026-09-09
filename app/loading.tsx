export default function Loading() {
  return (
    <div className="container loading" role="status">
      <span className="loading-mark" aria-hidden="true" />
      <span>Carregando conteúdo…</span>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <section className="empty-state container">
      <p className="eyebrow">Erro 404</p>
      <h1>Esta página não foi encontrada.</h1>
      <p>
        O conteúdo pode ter mudado de endereço ou não estar mais disponível.
      </p>
      <Link className="button" href="/">
        Voltar ao início
      </Link>
    </section>
  );
}

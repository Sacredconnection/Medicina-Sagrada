import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-title">Medicina Sagrada</p>
          <p>
            Conhecimentos ancestrais, arte e cultura das populações indígenas e
            tradicionais do Brasil.
          </p>
        </div>
        <nav aria-label="Links institucionais">
          <p className="footer-title">Ajuda</p>
          <ul>
            <li>
              <Link href="/sobre-nos/">Sobre nós</Link>
            </li>
            <li>
              <Link href="/atendimento/">Atendimento</Link>
            </li>
            <li>
              <Link href="/politica-de-privacidade/">
                Política de privacidade
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

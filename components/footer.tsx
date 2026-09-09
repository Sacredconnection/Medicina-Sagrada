import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand-block">
          <Link className="footer-brand" href="/">
            <span className="brand-symbol" aria-hidden="true">MS</span>
            <span className="brand-name"><strong>Medicina</strong><em>Sagrada</em></span>
          </Link>
          <p>Conhecimentos ancestrais, arte e cultura das populações indígenas e tradicionais do Brasil.</p>
          <span className="footer-note">Feito com respeito à floresta e aos seus povos.</span>
        </div>
        <nav aria-label="Produtos">
          <p className="footer-title">Explore</p>
          <ul>
            <li><Link href="/product-category/rape/">Rapé</Link></li>
            <li><Link href="/product-category/sananga/">Sananga</Link></li>
            <li><Link href="/product-category/incensos/">Incensos</Link></li>
            <li><Link href="/product-category/artesanato/">Artesanato</Link></li>
          </ul>
        </nav>
        <nav aria-label="Links institucionais">
          <p className="footer-title">Acompanhe</p>
          <ul>
            <li><Link href="/sobre-nos/">Sobre nós</Link></li>
            <li><Link href="/atendimento/">Atendimento</Link></li>
            <li><Link href="/politica-de-privacidade/">Privacidade</Link></li>
            <li><Link href="/trocas-e-devolucoes/">Trocas e devoluções</Link></li>
          </ul>
        </nav>
        <div className="footer-contact">
          <p className="footer-title">Fale com a gente</p>
          <a href="mailto:contato@medicinasagrada.com.br">contato@medicinasagrada.com.br</a>
          <a href="https://wa.me/5522992289365">WhatsApp: (22) 99228-9365</a>
          <div className="social-links"><a href="https://www.instagram.com/medicinasagradabr/">Instagram</a><a href="https://www.youtube.com/@medicinasagradabr">YouTube</a></div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© Medicina Sagrada 2026</span>
        <span>Medicinas, arte e cultura do Brasil</span>
      </div>
    </footer>
  );
}

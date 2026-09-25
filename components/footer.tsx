import Image from "next/image";
import Link from "next/link";

type FooterIconName = "email" | "instagram" | "whatsapp" | "youtube";

function FooterIcon({ name }: { name: FooterIconName }) {
  const paths: Record<FooterIconName, React.ReactNode> = {
    email: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.3A8.5 8.5 0 1 1 20.5 11.6Z" />
        <path d="M8.3 7.7c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.8c.1.3.1.5-.1.7l-.6.8c-.2.2-.2.4 0 .7.7 1.2 1.7 2.2 3 2.8.3.2.5.1.7-.1l.9-1.1c.2-.3.5-.3.7-.2l1.9.9c.3.1.5.3.5.5 0 .4-.2 1.5-1 2.1-.6.5-1.4.8-2.3.7-1-.1-2.3-.5-4-2-2.1-1.8-3.4-4-3.5-5.6 0-.8.3-1.5.7-2.1Z" />
      </>
    ),
    youtube: (
      <>
        <path d="M21 12s0-3-.4-4.4c-.2-.8-.8-1.4-1.6-1.6-1.4-.4-7-.4-7-.4s-5.6 0-7 .4c-.8.2-1.4.8-1.6 1.6C3 9 3 12 3 12s0 3 .4 4.4c.2.8.8 1.4 1.6 1.6 1.4.4 7 .4 7 .4s5.6 0 7-.4c.8-.2 1.4-.8 1.6-1.6C21 15 21 12 21 12Z" />
        <path d="m10 15 5-3-5-3v6Z" />
      </>
    ),
  };

  return (
    <svg className="footer-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand-block">
          <Link className="footer-brand" href="/" aria-label="Medicina Sagrada — início">
            <Image
              className="footer-brand-logo"
              src="/assets/logo/medicina-sagrada-logo-01.svg"
              alt=""
              width={1200}
              height={300}
            />
          </Link>
          <p>Conhecimentos ancestrais, arte e cultura das populações indígenas e tradicionais do Brasil.</p>
          <span className="footer-note">Feito com respeito à floresta e aos seus povos.</span>
        </div>
        <nav className="footer-nav" aria-label="Produtos">
          <p className="footer-title">Explore</p>
          <ul className="footer-nav-list">
            <li><Link href="/product-category/rape/">Rapé</Link></li>
            <li><Link href="/product-category/medicinais/sananga-medicinais/">Sananga</Link></li>
            <li><Link href="/product-category/incensos/">Incensos</Link></li>
            <li><Link href="/product-category/acessorios/">Acessórios</Link></li>
            <li><Link href="/product-category/artesanato/">Artesanato</Link></li>
            <li><Link href="/product-category/kits/">Kits</Link></li>
          </ul>
        </nav>
        <nav className="footer-nav" aria-label="Ajuda e informações">
          <p className="footer-title">Ajuda</p>
          <ul className="footer-nav-list">
            <li><Link href="/sobre-nos/">Sobre nós</Link></li>
            <li><Link href="/atendimento/">Atendimento</Link></li>
            <li><Link href="/atacado/">Atacado</Link></li>
            <li><Link href="/politica-de-privacidade/">Política de Privacidade</Link></li>
            <li><Link href="/refund_returns/">Trocas e devoluções</Link></li>
          </ul>
        </nav>
        <div className="footer-contact">
          <p className="footer-title">Fale com a gente</p>
          <div className="footer-contact-links">
            <a href="mailto:contato@medicinasagrada.com.br">
              <FooterIcon name="email" />
              <span>contato@medicinasagrada.com.br</span>
            </a>
            <a href="https://wa.me/5522992289365" target="_blank" rel="noreferrer">
              <FooterIcon name="whatsapp" />
              <span>(22) 99228-9365</span>
            </a>
          </div>
          <p className="footer-title footer-social-title">Siga a Medicina Sagrada</p>
          <div className="social-links">
            <a href="https://www.instagram.com/medicinasagradabr/" target="_blank" rel="noreferrer" aria-label="Medicina Sagrada no Instagram">
              <FooterIcon name="instagram" />
              <span>Instagram</span>
            </a>
            <a href="https://www.youtube.com/@medicinasagradabr" target="_blank" rel="noreferrer" aria-label="Medicina Sagrada no YouTube">
              <FooterIcon name="youtube" />
              <span>YouTube</span>
            </a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© Medicina Sagrada 2026</span>
        <span>Medicinas, arte e cultura do Brasil</span>
      </div>
    </footer>
  );
}

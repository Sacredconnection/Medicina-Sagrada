import Image from "next/image";
import Link from "next/link";
import { CartLink } from "@/components/cart-link";
import { ScrollToTopLink } from "@/components/scroll-to-top-link";
import { config } from "@/lib/config";

const navigation = [
  { href: "/product-category/rape/", label: "Rapé" },
  { href: "/product-category/medicinais/sananga-medicinais/", label: "Sananga" },
  { href: "/product-category/incensos/", label: "Incensos" },
  { href: "/product-category/acessorios/", label: "Acessórios" },
  { href: "/product-category/artesanato/", label: "Artesanato" },
];

function AccountIcon() {
  return (
    <svg className="header-line-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 20c0-4 3.13-6.5 7-6.5s7 2.5 7 6.5" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <ScrollToTopLink className="brand">
          <Image
            className="brand-logo"
            src="/assets/logo/medicina-sagrada-logo-01.svg"
            alt=""
            width={1200}
            height={300}
          />
        </ScrollToTopLink>
        <details className="mobile-menu">
          <summary className="mobile-menu-toggle" aria-label="Abrir ou fechar o menu de categorias">
            <span className="material-symbols-rounded material-symbols-heavy menu-icon menu-icon-open" aria-hidden="true">menu</span>
            <span className="material-symbols-rounded material-symbols-heavy menu-icon menu-icon-close" aria-hidden="true">close</span>
          </summary>
          <nav className="mobile-nav" aria-label="Navegação principal no celular">
            <ul className="mobile-nav-list">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
            <ul className="mobile-nav-actions" aria-label="Conta e compras">
              <li>
                <a href={config.wooAccountUrl}>
                  <AccountIcon />
                  <span>Minha conta</span>
                </a>
              </li>
              <li>
                <CartLink mobile />
              </li>
            </ul>
          </nav>
        </details>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <ul className="nav-list">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-actions" aria-label="Ações da conta e loja">
          <Link
            className="header-icon-button header-search-button"
            href="/busca/"
            aria-label="Buscar produtos"
          >
            <span className="material-symbols-rounded header-action-symbol" aria-hidden="true">search</span>
          </Link>
          <span className="header-desktop-actions">
            <a className="header-icon-button" href={config.wooAccountUrl} aria-label="Minha conta">
              <AccountIcon />
            </a>
            <CartLink />
          </span>
          <span className="header-mobile-cart"><CartLink /></span>
        </div>
      </div>
      <div className="header-accent-bar" aria-hidden="true" />
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";

const navigation = [
  { href: "/product-category/rape/", label: "Rapé" },
  { href: "/product-category/sananga/", label: "Sananga" },
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

function BagIcon() {
  return (
    <svg className="header-line-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8.5h14l-.75 12H5.75L5 8.5Z" />
      <path d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
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
                <Link href="/account/">
                  <AccountIcon />
                  <span>Minha conta</span>
                </Link>
              </li>
              <li>
                <Link href="/checkout/">
                  <BagIcon />
                  <span>Sacola</span>
                </Link>
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
        <Link className="brand" href="/" aria-label="Medicina Sagrada — início">
          <Image
            className="brand-logo"
            src="/assets/logo/medicina-sagrada-logo-01.svg"
            alt=""
            width={1200}
            height={300}
          />
        </Link>
        <div className="header-actions" aria-label="Ações da conta e loja">
          <Link
            className="header-icon-button header-search-button"
            href="/busca/"
            aria-label="Buscar produtos"
          >
            <span className="material-symbols-rounded header-action-symbol" aria-hidden="true">search</span>
          </Link>
          <span className="header-desktop-actions">
            <Link className="header-icon-button" href="/account/" aria-label="Minha conta">
              <AccountIcon />
            </Link>
            <Link className="header-icon-button" href="/checkout/" aria-label="Sacola">
              <BagIcon />
            </Link>
          </span>
        </div>
      </div>
      <div className="header-accent-bar" aria-hidden="true" />
    </header>
  );
}

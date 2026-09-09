import Image from "next/image";
import Link from "next/link";

const navigation = [
  { href: "/product-category/rape/", label: "Rapé" },
  { href: "/product-category/sananga/", label: "Sananga" },
  { href: "/product-category/incensos/", label: "Incensos" },
  { href: "/product-category/acessorios/", label: "Acessórios" },
  { href: "/product-category/artesanato/", label: "Artesanato" },
];

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="Medicina Sagrada — início">
          <Image
            className="brand-logo"
            src="/assets/logo/medicina-sagrada-logo-01.svg"
            alt=""
            width={1200}
            height={300}
          />
        </Link>
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
            className="header-icon-button"
            href="/busca/"
            aria-label="Buscar produtos"
          >
            <span className="material-symbols-rounded material-symbols-heavy" aria-hidden="true">search</span>
          </Link>
          <Link className="header-icon-button" href="/account/" aria-label="Minha conta">
            <span className="material-symbols-rounded" aria-hidden="true">person</span>
          </Link>
          <Link className="header-icon-button" href="/checkout/" aria-label="Sacola">
            <span className="material-symbols-rounded" aria-hidden="true">shopping_bag</span>
          </Link>
        </div>
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
          </nav>
        </details>
      </div>
      <div className="header-accent-bar" aria-hidden="true" />
    </header>
  );
}

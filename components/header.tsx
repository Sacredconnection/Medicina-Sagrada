import Image from "next/image";
import Link from "next/link";

const navigation = [
  { href: "/product-category/rape/", label: "Rapé" },
  { href: "/product-category/sananga/", label: "Sananga" },
  { href: "/product-category/incensos/", label: "Incensos" },
  { href: "/product-category/acessorios/", label: "Acessórios" },
  { href: "/product-category/artesanato/", label: "Artesanato" },
];

function DeliveryIcon() {
  return (
    <svg className="utility-icon utility-icon-delivery" aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3.25 5.5h10.5A1.25 1.25 0 0 1 15 6.75V16H9.86a3.15 3.15 0 0 0-5.72 0H2V6.75A1.25 1.25 0 0 1 3.25 5.5Z" />
      <path d="M15 9h2.55c.45 0 .87.2 1.15.55l2.65 3.25c.21.26.32.58.32.91V16h-1.81a3.15 3.15 0 0 0-4.86-1.03V9Z" />
      <circle cx="7" cy="17" r="2.2" />
      <circle cx="17" cy="17" r="2.2" />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg className="utility-icon utility-icon-community" aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="7.25" r="3.1" />
      <circle cx="5.25" cy="9.25" r="2.25" />
      <circle cx="18.75" cy="9.25" r="2.25" />
      <path d="M12 11.25c-3.45 0-6.25 2.18-6.25 4.88V19h12.5v-2.87c0-2.7-2.8-4.88-6.25-4.88Z" />
      <path d="M4.9 12.25C2.74 12.25 1 13.8 1 15.7V18h3.35v-1.87c0-1.3.48-2.5 1.3-3.5a5.1 5.1 0 0 0-.75-.38ZM19.1 12.25c-.26 0-.5.04-.75.1.82 1.08 1.3 2.38 1.3 3.78V18H23v-2.3c0-1.9-1.74-3.45-3.9-3.45Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="utility-icon utility-icon-whatsapp" aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 2.25a9.5 9.5 0 0 0-8.2 14.3L2.35 21.6l5.15-1.35A9.5 9.5 0 1 0 12 2.25Z" />
      <path className="utility-icon-cutout" d="M8.05 6.85c.4-.4.9-.15 1.15.35l.65 1.3c.15.3.1.65-.15.9l-.65.65a7.9 7.9 0 0 0 3.8 3.8l.65-.65c.25-.25.6-.3.9-.15l1.3.65c.5.25.75.75.35 1.15-.65.65-1.6 1-2.55.8A9.5 9.5 0 0 1 7.25 9.4c-.2-.95.15-1.9.8-2.55Z" />
    </svg>
  );
}

const trustItems = [
  {
    label: "Envio 100% discreto e seguro para todo o Brasil",
    Icon: DeliveryIcon,
  },
  {
    label: "Parceria direta com artesãos e comunidades indígenas",
    Icon: CommunityIcon,
  },
  {
    label: "Dúvidas sobre dosagem ou uso? Fale no WhatsApp direto",
    Icon: WhatsAppIcon,
    href: "https://wa.me/5522992289365",
  },
];

function TrustSequence({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className="trust-sequence" aria-hidden={duplicate || undefined}>
      {trustItems.map(({ label, Icon, href }) => {
        const content = (
          <>
            <Icon />
            <span>{label}</span>
          </>
        );

        return href && !duplicate ? (
          <a className="utility-item utility-contact" href={href} key={label}>
            {content}
          </a>
        ) : (
          <span className="utility-item" key={label}>
            {content}
          </span>
        );
      })}
    </div>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="container utility-inner utility-desktop" aria-label="Informações de confiança e atendimento">
          <TrustSequence />
        </div>
        <div className="trust-ticker" aria-label="Informações de confiança e atendimento">
          <div className="trust-track">
            <TrustSequence />
            <TrustSequence duplicate />
          </div>
        </div>
      </div>
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
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6" />
              <path d="m15.5 15.5 4 4" />
            </svg>
          </Link>
          <Link className="header-icon-button" href="/checkout/" aria-label="Sacola">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M4 9h16l-1.5 10h-13L4 9Z" />
              <path d="m8 9 3-5M16 9l-3-5" />
            </svg>
          </Link>
          <Link className="header-icon-button" href="/account/" aria-label="Minha conta">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="12" cy="7" r="4" />
              <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
            </svg>
          </Link>
        </div>
        <details className="mobile-menu">
          <summary className="mobile-menu-toggle" aria-label="Abrir ou fechar o menu de categorias">
            <svg className="menu-icon menu-icon-open" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <svg className="menu-icon menu-icon-close" aria-hidden="true" viewBox="0 0 24 24">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
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
    </header>
  );
}

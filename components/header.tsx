import Image from "next/image";
import Link from "next/link";
import { CartLink } from "@/components/cart-link";
import { ScrollToTopLink } from "@/components/scroll-to-top-link";
import { config } from "@/lib/config";
import { HeaderNavigation, type NavigationItem } from "@/components/header-navigation";
import { getAllProductCategories, getProductBySlug } from "@/lib/woocommerce";
import { monthlyProductSlug } from "@/lib/monthly-product";
import { pathnameFromUrl } from "@/lib/url";
import { plainText } from "@/lib/html";
import { canonicalizeEthnicityNames, getEthnicityTheme } from "@/lib/ethnicity-colors";

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

export async function Header() {
  const categories = await getAllProductCategories().catch((error) => {
    console.warn("Não foi possível carregar as subcategorias do menu.", error);
    return [];
  });
  const descendants = (parent: number, visited = new Set<number>()): NavigationItem[] =>
    categories.filter((category) => category.parent === parent && !visited.has(category.id))
      .map((category) => ({
        label: canonicalizeEthnicityNames(plainText(category.name)),
        href: pathnameFromUrl(category.permalink),
        children: descendants(category.id, new Set([...visited, category.id])),
      }));
  const items: NavigationItem[] = navigation.map((item) => {
    const category = categories.find((category) => pathnameFromUrl(category.permalink) === item.href);
    return { ...item, children: category ? descendants(category.id) : [] };
  });
  items.push({ label: "Aprenda", href: "/aprenda/", children: [{ label: "Blog", href: "/blog/" }] });
  if (monthlyProductSlug) {
    const product = await getProductBySlug(monthlyProductSlug).catch(() => null);
    if (product) {
      const ethnicityTheme = getEthnicityTheme(product.categories);
      items[0].feature = {
        name: canonicalizeEthnicityNames(plainText(product.name)),
        href: `/product/${product.slug}/`,
        image: product.images[0]?.src,
        accent: ethnicityTheme?.accent,
        foreground: ethnicityTheme?.foreground,
      };
    }
  }
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
            loading="eager"
          />
        </ScrollToTopLink>
        <details className="mobile-menu">
          <summary className="mobile-menu-toggle" aria-label="Abrir ou fechar o menu de categorias">
            <svg className="header-line-icon menu-icon menu-icon-open" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            <svg className="header-line-icon menu-icon menu-icon-close" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </summary>
          <nav className="mobile-nav" aria-label="Navegação principal no celular">
            <HeaderNavigation items={items} mobile />
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
          <HeaderNavigation items={items} />
        </nav>
        <div className="header-actions" aria-label="Ações da conta e loja">
          <Link
            className="header-icon-button header-search-button"
            href="/busca/"
            aria-label="Buscar produtos"
          >
            <svg className="header-line-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
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

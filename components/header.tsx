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
          <span className="brand-mark" aria-hidden="true">
            MS
          </span>
          <span>Medicina Sagrada</span>
        </Link>
        <nav aria-label="Navegação principal">
          <ul className="nav-list">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

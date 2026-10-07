"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type CSSProperties } from "react";
import { getEthnicityTheme } from "@/lib/ethnicity-colors";

type NavigationFeature = {
  name: string;
  href: string;
  image?: string;
  price: string;
  accent?: string;
  foreground?: string;
};

export type NavigationItem = {
  label: string;
  href: string;
  children?: NavigationItem[];
  feature?: NavigationFeature;
};

const categoryFeatureImages: Record<string, string> = {
  Sananga: "/assets/home/categories/medicina-sagrada-categoria-sananga.webp",
  Incensos: "/assets/home/categories/medicina-sagrada-categoria-incensos.webp",
  "Acessórios": "/assets/home/categories/medicina-sagrada-categoria-acessorios.webp",
  Artesanato: "/assets/home/categories/medicina-sagrada-categoria-artesanato.webp",
  Aprenda: "/assets/home/story/pillars/medicina-sagrada-conhecimentos-ancestrais.webp",
};

function isCurrentPage(pathname: string, href: string) {
  return pathname.replace(/\/$/, "") === href.replace(/\/$/, "");
}

function isCurrentSection(pathname: string, item: NavigationItem): boolean {
  return isCurrentPage(pathname, item.href)
    || pathname.startsWith(`${item.href.replace(/\/$/, "")}/`)
    || !!item.children?.some((child) => isCurrentSection(pathname, child));
}

function CategoryLinks({ items, isRape, pathname }: { items: NavigationItem[]; isRape: boolean; pathname: string }) {
  return <ul className="mega-category-list">{items.map((item) => {
    const theme = isRape ? getEthnicityTheme([{ name: item.label, slug: "" }]) : undefined;
    const style = theme ? {
      "--ethnicity-accent": theme.accent,
    } as CSSProperties : undefined;

    return <li key={item.href}>
      <Link href={item.href} aria-current={isCurrentPage(pathname, item.href) ? "page" : undefined} className={theme ? "ethnicity-link" : undefined} style={style}>{theme?.name ?? item.label}</Link>
      {!!item.children?.length && <CategoryLinks items={item.children} isRape={isRape} pathname={pathname} />}
    </li>;
  })}</ul>;
}

function MegaPanel({ item, pathname }: { item: NavigationItem; pathname: string }) {
  const isRape = item.href === "/product-category/rape/";
  const isLearn = item.href === "/aprenda/";
  const contentLinks = isLearn
    ? [{ label: "Primeiros Passos", href: item.href }, ...(item.children ?? [])]
    : item.children ?? [];
  const categoryFeatureImage = categoryFeatureImages[item.label];
  const featureStyle = item.feature ? {
    "--mega-product-accent": item.feature.accent,
    "--mega-product-foreground": item.feature.foreground,
  } as CSSProperties : undefined;
  return <div className="navigation-mega"><div className="container mega-inner">
    <div className="mega-intro">
      <p className="mega-caption">{isLearn ? "Conhecimentos da floresta" : "Explore a loja"}</p>
      <h2>{item.label}</h2>
      <p>{isLearn ? "Guias, histórias e saberes para conhecer as tradições e escolher com consciência." : isRape ? "Conheça as diferentes origens e encontre seu rapé." : `Conheça nossa coleção de ${item.label.toLocaleLowerCase("pt-BR")} e explore as categorias.`}</p>
      <Link className="mega-all" href={item.href} aria-current={isCurrentPage(pathname, item.href) ? "page" : undefined}>{isLearn ? "Conheça os primeiros passos" : "Ver toda a coleção"}</Link>
    </div>
    <div className={`mega-categories${isLearn ? " mega-categories-learn" : ""}`}><p className="mega-caption">{isLearn ? "Conteúdos" : isRape ? "Explore os rapés" : "Categorias"}</p><CategoryLinks items={contentLinks} isRape={isRape} pathname={pathname} /></div>
    <div className="mega-feature" style={featureStyle}>
      <p className={`mega-caption${isRape && item.feature ? " mega-feature-caption" : ""}`}>
        {isRape && item.feature ? <>
          <span className="mega-feature-caption-title">
            <svg className="mega-feature-caption-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 3v3M17 3v3M4.5 9h15M6 5h12a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
              <path d="m12 12 .75 1.52 1.68.24-1.22 1.19.29 1.68-1.5-.79-1.5.79.29-1.68-1.22-1.19 1.68-.24L12 12Z" />
            </svg>
            Rapé do mês
          </span>
          <span className="mega-feature-caption-discount">
            <strong>10%</strong>
            <span>de desconto</span>
          </span>
        </> : "Em destaque"}
      </p>
      {item.feature ? <Link
        className="mega-product"
        href={item.feature.href}
      >
        <span className="mega-product-image">
          {item.feature.image && <Image src={item.feature.image} alt="" width={480} height={480} sizes="(min-width: 1001px) 22rem, 1px" />}
        </span>
        <span className="mega-product-details">
          <span className="mega-product-name">{item.feature.name}</span>
          <span className="mega-feature-cta">Aproveitar o desconto</span>
        </span>
      </Link> : <Link className="mega-collection" href={item.href}>
        <span className="mega-collection-image">
          {categoryFeatureImage && <Image src={categoryFeatureImage} alt="" width={480} height={480} sizes="(min-width: 1001px) 22rem, 1px" />}
        </span>
        <span className="mega-collection-details">
          <span className="mega-collection-name">{item.label}</span>
          <span className="mega-feature-cta">{isLearn ? "Explore os guias" : "Conheça a coleção"}</span>
        </span>
      </Link>}
    </div>
  </div></div>;
}

function MobileFeaturedProduct({ feature }: { feature: NavigationFeature }) {
  const featureStyle = {
    "--mega-product-accent": feature.accent,
    "--mega-product-foreground": feature.foreground,
  } as CSSProperties;

  return <Link className="mobile-featured-product" href={feature.href} style={featureStyle}>
    <span className="mobile-featured-image">
      {feature.image && <Image src={feature.image} alt="" width={180} height={180} sizes="6.25rem" />}
    </span>
    <span className="mobile-featured-content">
      <span className="mobile-featured-kicker">Rapé do mês</span>
      <span className="mobile-featured-name">{feature.name}</span>
      <span className="mobile-featured-footer">
        <span className="mobile-featured-discount"><strong>10%</strong><span className="mobile-featured-discount-copy"> de desconto</span></span>
        <span className="mobile-featured-cta">Aproveitar</span>
      </span>
    </span>
  </Link>;
}

function Branch({ item, mobile, pathname }: { item: NavigationItem; mobile: boolean; pathname: string }) {
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  useEffect(() => () => { if (closeTimer.current !== null) clearTimeout(closeTimer.current); }, []);
  if (!item.children?.length) return <Link href={item.href} aria-current={isCurrentPage(pathname, item.href) ? "page" : undefined}>{item.label}</Link>;

  return (
    <details className="navigation-disclosure" data-active={isCurrentSection(pathname, item) || undefined} name={mobile ? undefined : "desktop-navigation"}
      onMouseEnter={(event) => {
        cancelClose();
        if (!mobile && window.matchMedia("(hover: hover)").matches) event.currentTarget.open = true;
      }}
      onMouseLeave={(event) => {
        if (mobile) return;
        cancelClose();
        const detail = event.currentTarget;
        closeTimer.current = setTimeout(() => {
          if (!detail.contains(document.activeElement)) detail.open = false;
          closeTimer.current = null;
        }, 220);
      }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}
    >
      <summary>{item.label}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg></summary>
      {!mobile ? <MegaPanel item={item} pathname={pathname} /> : <ul className="navigation-submenu">
        <li><Link className="navigation-view-all" href={item.href} aria-current={isCurrentPage(pathname, item.href) ? "page" : undefined}>{item.href === "/aprenda/" ? "Primeiros passos" : `Ver tudo em ${item.label}`}</Link></li>
        {item.children.map((child) => <li key={child.href}><Branch item={child} mobile={mobile} pathname={pathname} /></li>)}
      </ul>}
    </details>
  );
}

export function HeaderNavigation({ items, mobile = false }: { items: NavigationItem[]; mobile?: boolean }) {
  const list = useRef<HTMLUListElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const menu = mobile ? list.current?.closest<HTMLDetailsElement>("details.mobile-menu") : null;
    const closeMenu = (restoreFocus = false) => {
      if (!menu?.open) return;
      menu.open = false;
      menu.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((detail) => { detail.open = false; });
      if (restoreFocus) menu.querySelector("summary")?.focus();
    };
    const closeOutside = (event: PointerEvent) => {
      if (menu && !menu.contains(event.target as Node)) {
        closeMenu(menu.contains(document.activeElement));
      }
      if (!list.current?.contains(event.target as Node)) {
        list.current?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((detail) => { detail.open = false; });
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !menu?.open) return;
      if ((event.target as Element).closest("details.navigation-disclosure[open]")) return;
      event.preventDefault();
      closeMenu(true);
    };
    const closeOnLink = (event: MouseEvent) => {
      if ((event.target as Element).closest("a")) closeMenu();
    };
    const closeOnFocusLeave = (event: FocusEvent) => {
      if (event.relatedTarget && !menu?.contains(event.relatedTarget as Node)) closeMenu();
    };
    document.addEventListener("pointerdown", closeOutside);
    menu?.addEventListener("keydown", closeOnEscape);
    menu?.addEventListener("click", closeOnLink);
    menu?.addEventListener("focusout", closeOnFocusLeave);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      menu?.removeEventListener("keydown", closeOnEscape);
      menu?.removeEventListener("click", closeOnLink);
      menu?.removeEventListener("focusout", closeOnFocusLeave);
    };
  }, [mobile]);

  useEffect(() => {
    list.current?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((detail) => { detail.open = false; });
    const menu = list.current?.closest<HTMLDetailsElement>("details.mobile-menu");
    if (menu) menu.open = false;
  }, [pathname]);

  return (
    <ul ref={list} className={mobile ? "mobile-nav-list" : "nav-list"}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        const detail = (event.target as HTMLElement).closest("details.navigation-disclosure[open]") as HTMLDetailsElement | null;
        if (detail) { event.preventDefault(); event.stopPropagation(); detail.open = false; detail.querySelector("summary")?.focus(); }
      }}
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest("a")) return;
        list.current?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((detail) => { detail.open = false; });
        const menu = list.current?.closest("details.mobile-menu") as HTMLDetailsElement | null;
        if (menu) menu.open = false;
      }}
    >
      {items.map((item) => <li key={item.href}>
        {mobile && item.feature ? <MobileFeaturedProduct feature={item.feature} /> : null}
        <Branch item={item} mobile={mobile} pathname={pathname} />
      </li>)}
    </ul>
  );
}

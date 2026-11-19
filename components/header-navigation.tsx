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
  accent?: string;
  foreground?: string;
};

export type NavigationItem = {
  label: string;
  href: string;
  children?: NavigationItem[];
  feature?: NavigationFeature;
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
  return <div className="category-dropdown">
    <Link className="category-overview" href={item.href}>
      {item.href === "/aprenda/" ? "Primeiros passos" : `Ver tudo em ${item.label}`}
    </Link>
    <CategoryLinks items={item.children ?? []} isRape={isRape} pathname={pathname} />
    {item.feature && <Link className="category-feature-link" href={item.feature.href}>{item.feature.name}</Link>}
  </div>;
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
        <span className="mobile-featured-cta">Conhecer o produto</span>
      </span>
    </span>
  </Link>;
}

function Branch({ item, mobile, pathname, group = "mobile-navigation" }: { item: NavigationItem; mobile: boolean; pathname: string; group?: string }) {
  if (!item.children?.length) return <Link href={item.href} aria-current={isCurrentPage(pathname, item.href) ? "page" : undefined}>{item.label}</Link>;

  return (
    <details className="navigation-disclosure" data-active={isCurrentSection(pathname, item) || undefined} name={mobile ? group : "desktop-navigation"}
      onToggle={(event) => {
        if (!mobile || event.currentTarget.open) return;
        event.currentTarget.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((detail) => { detail.open = false; });
      }}
      onBlur={(event) => { if (!mobile && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}
    >
      <summary>
        <Link href={item.href} aria-current={isCurrentPage(pathname, item.href) ? "page" : undefined}>{item.label}</Link>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
      </summary>
      {!mobile ? <MegaPanel item={item} pathname={pathname} /> : <ul className="navigation-submenu">
        <li><Link className="navigation-view-all" href={item.href} aria-current={isCurrentPage(pathname, item.href) ? "page" : undefined}>{item.href === "/aprenda/" ? "Primeiros passos" : `Ver tudo em ${item.label}`}</Link></li>
        {item.children.map((child) => <li key={child.href}><Branch item={child} mobile={mobile} pathname={pathname} group={`mobile-navigation-${item.href}`} /></li>)}
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

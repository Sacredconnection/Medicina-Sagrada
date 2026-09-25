"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

export type NavigationItem = {
  label: string;
  href: string;
  children?: NavigationItem[];
  feature?: { name: string; href: string; image?: string; price: string };
};

function CategoryLinks({ items }: { items: NavigationItem[] }) {
  return <ul className="mega-category-list">{items.map((item) => <li key={item.href}>
    <Link href={item.href}>{item.label}</Link>
    {!!item.children?.length && <CategoryLinks items={item.children} />}
  </li>)}</ul>;
}

function MegaPanel({ item }: { item: NavigationItem }) {
  const isRape = item.href === "/product-category/rape/";
  const categorySlug = item.href.split("/").filter(Boolean).at(-1);
  return <div className="navigation-mega"><div className="container mega-inner">
    <div className="mega-intro">
      <p className="mega-caption">Explore a loja</p>
      <h2>{item.label}</h2>
      <p>{isRape ? "Conheça as diferentes origens e encontre seu rapé." : `Conheça nossa coleção de ${item.label.toLocaleLowerCase("pt-BR")} e explore as categorias.`}</p>
      <Link className="mega-all" href={item.href}>Ver toda a coleção <span aria-hidden="true">→</span></Link>
    </div>
    <div className="mega-categories"><p className="mega-caption">{isRape ? "Explore os rapés" : "Categorias"}</p><CategoryLinks items={item.children ?? []} /></div>
    <div className="mega-feature">
      <p className="mega-caption">{isRape ? "Rapé do mês" : "Em destaque"}</p>
      {item.feature ? <Link className="mega-product" href={item.feature.href}>
        <div className="mega-product-image">{item.feature.image && <Image src={item.feature.image} alt="" width={240} height={240} />}</div>
        <span className="mega-product-name">{item.feature.name}</span>
        <span className="mega-product-price">{item.feature.price}</span>
        <span className="mega-feature-cta">Conhecer este rapé <span aria-hidden="true">→</span></span>
      </Link> : <Link className="mega-collection" href={item.href}>
        <Image src={`/assets/home/categories/medicina-sagrada-categoria-${categorySlug}.webp`} alt="" width={340} height={220} />
        <span className="mega-feature-cta">Conheça {item.label} <span aria-hidden="true">→</span></span>
      </Link>}
    </div>
  </div></div>;
}

function Branch({ item, mobile }: { item: NavigationItem; mobile: boolean }) {
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  useEffect(() => () => { if (closeTimer.current !== null) clearTimeout(closeTimer.current); }, []);
  if (!item.children?.length) return <Link href={item.href}>{item.label}</Link>;

  return (
    <details className="navigation-disclosure" name={mobile ? undefined : "desktop-navigation"}
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
      {!mobile ? <MegaPanel item={item} /> : <ul className="navigation-submenu">
        <li><Link className="navigation-view-all" href={item.href}>Ver tudo em {item.label}</Link></li>
        {item.children.map((child) => <li key={child.href}><Branch item={child} mobile={mobile} /></li>)}
      </ul>}
    </details>
  );
}

export function HeaderNavigation({ items, mobile = false }: { items: NavigationItem[]; mobile?: boolean }) {
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!list.current?.contains(event.target as Node)) {
        list.current?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((detail) => { detail.open = false; });
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  return (
    <ul ref={list} className={mobile ? "mobile-nav-list" : "nav-list"}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        const detail = (event.target as HTMLElement).closest("details.navigation-disclosure") as HTMLDetailsElement | null;
        if (detail) { event.preventDefault(); event.stopPropagation(); detail.open = false; detail.querySelector("summary")?.focus(); }
      }}
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest("a")) return;
        list.current?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((detail) => { detail.open = false; });
        const menu = list.current?.closest("details.mobile-menu") as HTMLDetailsElement | null;
        if (menu) menu.open = false;
      }}
    >
      {items.map((item) => <li key={item.href}><Branch item={item} mobile={mobile} /></li>)}
    </ul>
  );
}

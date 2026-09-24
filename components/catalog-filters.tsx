"use client";

import Link from "next/link";
import { useState } from "react";
import { sortOptions, type CatalogQuery } from "@/lib/catalog-query";
import type { WooCategory } from "@/lib/types";

export function CatalogFilters({ query, categories, basePath, categoryId }: { query: CatalogQuery; categories: WooCategory[]; basePath: string; categoryId?: number }) {
  const [open, setOpen] = useState(false);
  return <aside className="catalog-sidebar" aria-label="Filtros do catálogo">
    <noscript><style>{".catalog-filter-fields{display:block!important}.catalog-filter-toggle{display:none!important}"}</style></noscript>
    <button className="catalog-filter-toggle commerce-button" aria-expanded={open} aria-controls="catalog-filter-fields" onClick={() => setOpen(!open)}>Filtros {open ? "−" : "+"}</button>
    <form id="catalog-filter-form" action={basePath} method="get" className="catalog-filter-fields" data-open={open}>
      <div id="catalog-filter-fields">
        <h2>Refinar sua busca</h2>
        {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
        {!categoryId ? <label className="commerce-field">Categoria<select name="categoria" defaultValue={query.category ?? ""}><option value="">Todas as categorias</option>{categories.filter(c => c.count > 0).map(c => <option key={c.id} value={c.id}>{c.parent ? "↳ " : ""}{c.name}</option>)}</select></label> : null}
        <fieldset><legend>Preço (R$)</legend><div className="catalog-price-fields">
          <label className="commerce-field">Mínimo<input name="min" type="number" min="0" max="999999.99" step="0.01" defaultValue={query.min === undefined ? "" : query.min / 100} placeholder="0" /></label>
          <label className="commerce-field">Máximo<input name="max" type="number" min="0" max="999999.99" step="0.01" defaultValue={query.max === undefined ? "" : query.max / 100} placeholder="Sem limite" /></label>
        </div></fieldset>
        <label className="catalog-checkbox"><input name="estoque" type="checkbox" value="1" defaultChecked={query.stock} />Somente em estoque</label>
        <label className="catalog-checkbox"><input name="oferta" type="checkbox" value="1" defaultChecked={query.sale} />Em oferta</label>
        <button className="commerce-button" type="submit">Aplicar filtros</button>
        <Link className="commerce-text-button" href={`${basePath}${query.q ? `?q=${encodeURIComponent(query.q)}` : ""}`}>Limpar filtros</Link>
        <nav className="catalog-categories" aria-label="Categorias da loja"><h3>Explore as categorias</h3>{categories.filter(c => c.count > 0 && (c.parent === (categoryId ?? 0))).map(c => <Link key={c.id} href={new URL(c.permalink).pathname}>{c.name} <span>({c.count})</span></Link>)}<Link href="/busca/">Ver todos os produtos →</Link></nav>
      </div>
    </form>
  </aside>;
}

export function CatalogSort({ value }: { value: CatalogQuery["sort"] }) {
  return <label className="catalog-sort">Ordenar por<select name="ordem" form="catalog-filter-form" defaultValue={value} onChange={event => event.currentTarget.form?.requestSubmit()}>{Object.entries(sortOptions).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select><noscript><button form="catalog-filter-form">Ordenar</button></noscript></label>;
}

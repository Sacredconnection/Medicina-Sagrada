"use client";

import Link from "next/link";
import Form from "next/form";
import { useState } from "react";
import { catalogSearch, sortOptions, type CatalogQuery } from "@/lib/catalog-query";
import type { WooCategory } from "@/lib/types";

export function CatalogFilters({ query, categories, basePath, categoryId }: { query: CatalogQuery; categories: WooCategory[]; basePath: string; categoryId?: number }) {
  const [open, setOpen] = useState(false);
  return <aside className="catalog-sidebar" aria-label="Filtros do catálogo">
    <noscript><style>{".catalog-filter-fields{display:block!important}.catalog-filter-toggle{display:none!important}"}</style></noscript>
    <button className="catalog-filter-toggle commerce-button" aria-expanded={open} aria-controls="catalog-filter-fields" onClick={() => setOpen(!open)}>Filtros {open ? "−" : "+"}</button>
    <Form key={catalogSearch(query).toString()} id="catalog-filter-form" action={basePath} scroll={false} className="catalog-filter-fields" data-open={open} onChange={event => {
      if (event.target instanceof HTMLInputElement && event.target.type === "checkbox") event.currentTarget.requestSubmit();
    }}>
      <div id="catalog-filter-fields">
        <h2>Refinar sua busca</h2>
        {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
        {categories.some(c => c.count > 0) ? <fieldset className="catalog-category-options"><legend>{categoryId ? "Subcategorias" : "Categorias"}</legend><p className="purchase-detail">Selecione uma ou mais opções.</p>{categories.filter(c => c.count > 0).map(c => <label className="catalog-checkbox" key={c.id}><input name="categoria" type="checkbox" value={c.id} defaultChecked={query.categories.includes(c.id)} /><span>{c.name} <small>({c.count})</small></span></label>)}</fieldset> : null}
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
    </Form>
  </aside>;
}

export function CatalogSort({ value }: { value: CatalogQuery["sort"] }) {
  return <label className="catalog-sort">Ordenar por<select name="ordem" form="catalog-filter-form" defaultValue={value} onChange={event => event.currentTarget.form?.requestSubmit()}>{Object.entries(sortOptions).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select><noscript><button form="catalog-filter-form">Ordenar</button></noscript></label>;
}

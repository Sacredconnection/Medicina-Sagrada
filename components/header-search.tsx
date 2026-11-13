"use client";

import Form from "next/form";
import { useEffect, useId, useRef, useState } from "react";

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    root.current?.closest("header")?.querySelectorAll<HTMLDetailsElement>("details[open]")
      .forEach(detail => { detail.open = false; });
    input.current?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={root} className="header-search" onBlur={event => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button ref={trigger} type="button" className="header-icon-button header-search-button"
        aria-label={open ? "Fechar pesquisa" : "Buscar produtos"}
        aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <svg className="header-line-icon" viewBox="0 0 24 24" aria-hidden="true">
          {open ? <path d="m6 6 12 12M18 6 6 18" /> : <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>}
        </svg>
      </button>
      {open && <Form id={id} action="/busca/" role="search" aria-label="Pesquisa de produtos" className="header-search-panel"
        onSubmit={event => {
          if (!input.current) return;
          input.current.value = input.current.value.trim();
          if (!input.current.value) {
            event.preventDefault();
            input.current.focus();
            return;
          }
          setOpen(false);
        }}>
        <label htmlFor={`${id}-input`} className="sr-only">O que você procura?</label>
        <input ref={input} id={`${id}-input`} name="q" type="search" className="search-input"
          placeholder="O que você procura?" maxLength={80} required />
        <button type="submit" className="commerce-button">Buscar</button>
      </Form>}
    </div>
  );
}

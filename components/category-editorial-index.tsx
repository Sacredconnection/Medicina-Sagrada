"use client";

import { useEffect, useRef, useState } from "react";

type EditorialIndexItem = {
  id: string;
  label: string;
};

export function CategoryEditorialIndex({
  items,
  categoryName,
}: {
  items: EditorialIndexItem[];
  categoryName: string;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (!headings.length) return;

    let frame = 0;
    const updateActiveHeading = () => {
      frame = 0;
      const stickyTop = Number.parseFloat(getComputedStyle(navRef.current ?? headings[0]).top) || 0;
      const activationLine = stickyTop + 24;
      let nextActiveId = headings[0].id;

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= activationLine) nextActiveId = heading.id;
        else break;
      }

      setActiveId((currentId) => currentId === nextActiveId ? currentId : nextActiveId);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveHeading);
    };

    updateActiveHeading();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [items]);

  useEffect(() => {
    const activeLink = navRef.current?.querySelector<HTMLElement>(`a[href="#${CSS.escape(activeId)}"]`);
    const list = activeLink?.closest("ol");
    if (!activeLink || !list) return;

    const linkRect = activeLink.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    if (linkRect.top < listRect.top) list.scrollTop -= listRect.top - linkRect.top;
    else if (linkRect.bottom > listRect.bottom) list.scrollTop += linkRect.bottom - listRect.bottom;
  }, [activeId]);

  return (
    <nav ref={navRef} className="category-editorial-index" aria-label={`Índice do conteúdo de ${categoryName}`}>
      <p>Neste conteúdo</p>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "location" : undefined}
              onClick={() => setActiveId(item.id)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

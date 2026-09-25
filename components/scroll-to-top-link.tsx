"use client";

import type { MouseEvent, ReactNode } from "react";

type ScrollToTopLinkProps = {
  children: ReactNode;
  className: string;
};

export function ScrollToTopLink({ children, className }: ScrollToTopLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}#top`,
    );

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <a
      className={className}
      href="#top"
      aria-label="Voltar ao topo da página"
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

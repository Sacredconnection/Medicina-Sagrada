"use client";

import Link from "next/link";
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

    if (window.location.pathname !== "/") return;

    event.preventDefault();

    window.history.replaceState(window.history.state, "", "/#top");

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <Link
      className={className}
      href="/#top"
      aria-label="Ir para a página inicial"
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

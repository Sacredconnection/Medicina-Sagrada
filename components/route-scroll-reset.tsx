"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

export function RouteScrollReset() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const historyNavigation = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      historyNavigation.current = window.location.pathname !== previousPath.current;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useLayoutEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (historyNavigation.current) {
      historyNavigation.current = false;
      return;
    }
    if (window.location.hash) return;

    // Next.js can retain the viewport when part of the new page is visible.
    // Finish after its layout work, without animating between different pages.
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}

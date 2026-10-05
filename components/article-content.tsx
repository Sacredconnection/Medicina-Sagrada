"use client";

import { useEffect, useRef } from "react";

export function ArticleContent({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const recoverImage = (image: HTMLImageElement) => {
      const figure = image.closest<HTMLElement>("figure.article-media");
      if (!figure) return;
      figure.hidden = true;
      // Keep the working version when an old responsive banner is unavailable.
      const counterpart = figure.classList.contains("article-media-mobile")
        ? figure.previousElementSibling
        : figure.classList.contains("article-media-desktop")
          ? figure.nextElementSibling
          : null;
      if (counterpart?.matches("figure.article-media-mobile, figure.article-media-desktop") &&
        !counterpart.hasAttribute("hidden")) {
        counterpart.classList.add("article-media-fallback");
      }
    };
    const handleError = (event: Event) => {
      if (event.target instanceof HTMLImageElement) recoverImage(event.target);
    };
    content.addEventListener("error", handleError, true);
    content.querySelectorAll("img").forEach((image) => {
      if (image.complete && image.naturalWidth === 0) recoverImage(image);
    });
    return () => content.removeEventListener("error", handleError, true);
  }, [html]);

  return <div ref={contentRef} className="rich-text article-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function ExpandableDescription({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    const text = content.current?.firstElementChild;
    if (!(text instanceof HTMLElement)) return;
    const measure = () => {
      const previewHeight = parseFloat(getComputedStyle(text).lineHeight) * 4;
      setCanExpand(text.scrollHeight > previewHeight + 1);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(text);
    measure();
    return () => observer.disconnect();
  }, [children]);

  return (
    <div className="expandable-description" data-expanded={expanded}>
      <div id={id} ref={content} className="expandable-description-content">{children}</div>
      {canExpand && (
        <button
          type="button"
          className="expandable-description-toggle"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => {
            const restorePosition = expanded && content.current
              && content.current.getBoundingClientRect().top < 0;
            setExpanded(!expanded);
            if (restorePosition) {
              requestAnimationFrame(() => content.current?.scrollIntoView({ block: "start" }));
            }
          }}
        >
          {expanded ? "Ler menos" : "Ler mais"}
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
        </button>
      )}
    </div>
  );
}

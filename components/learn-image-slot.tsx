import { existsSync } from "node:fs";
import { join } from "node:path";

export function hasLearnImage(src: string) {
  return src.startsWith("/assets/aprenda/") && !src.includes("..") && existsSync(join(process.cwd(), "public", src));
}

/** O espaço permanece vazio até o arquivo canônico ser colocado em public. */
export function LearnImageSlot({ src, mobileSrc, alt = "", className = "" }: { src: string; mobileSrc?: string; alt?: string; className?: string }) {
  const desktop = hasLearnImage(src);
  const mobile = mobileSrc ? hasLearnImage(mobileSrc) : false;
  const fallback = desktop ? src : mobile ? mobileSrc : undefined;
  return <div className={`learn-image-slot ${className}`} data-image-slot={src}>
    {fallback ? <picture>{mobile && desktop ? <source media="(max-width: 639px)" srcSet={mobileSrc} /> : null}
      <img src={fallback} alt={alt} loading="lazy" />
    </picture> : null}
  </div>;
}

import { existsSync } from "node:fs";
import { join } from "node:path";
import { getImageProps } from "next/image";

export function hasLearnImage(src: string) {
  return src.startsWith("/assets/aprenda/") && !src.includes("..") && existsSync(join(process.cwd(), "public", src));
}

/** O espaço permanece vazio até o arquivo canônico ser colocado em public. */
export function LearnImageSlot({ src, mobileSrc, alt = "", className = "", sizes = "100vw" }: { src: string; mobileSrc?: string; alt?: string; className?: string; sizes?: string }) {
  const desktop = hasLearnImage(src);
  const mobile = mobileSrc ? hasLearnImage(mobileSrc) : false;
  const fallback = desktop ? src : mobile ? mobileSrc : undefined;
  const options = { alt, fill: true, sizes, quality: 90, loading: "lazy" as const, unoptimized: process.env.NODE_ENV === "development" };
  const image = fallback ? getImageProps({ ...options, src: fallback }).props : null;
  const mobileImage = mobile && desktop ? getImageProps({ ...options, src: mobileSrc! }).props : null;
  return <div className={`learn-image-slot ${className}`} data-image-slot={src}>
    {image ? <picture>{mobileImage ? <source media="(max-width: 639px)" srcSet={mobileImage.srcSet ?? mobileImage.src} sizes={sizes} /> : null}
      <img {...image} alt={alt} />
    </picture> : null}
  </div>;
}

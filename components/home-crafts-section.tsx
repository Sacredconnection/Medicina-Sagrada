import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import type { CSSProperties } from "react";

const craftAssets = [
  "medicina-sagrada-artesanato-destaque-01.webp",
  "medicina-sagrada-artesanato-destaque-02.webp",
] as const;

function getCraftImageStyle(filename: (typeof craftAssets)[number]) {
  const absolutePath = join(
    process.cwd(),
    "public",
    "assets",
    "home",
    "crafts",
    filename,
  );

  if (!existsSync(absolutePath)) return undefined;

  return {
    "--craft-image": `url("/assets/home/crafts/${filename}")`,
  } as CSSProperties;
}

export function HomeCraftsSection() {
  return (
    <section className="crafts-section" aria-labelledby="crafts-title">
      <div className="container crafts-layout">
        <div className="crafts-copy">
          <h2 id="crafts-title">Artesanatos que mantêm histórias vivas</h2>
          <p>
            Peças que expressam arte, identidade e saberes da floresta, escolhidas
            com respeito às histórias e ao protagonismo de quem cria.
          </p>
          <Link
            className="button crafts-cta crafts-cta-desktop"
            href="/product-category/artesanato/"
          >
            Conhecer os artesanatos
          </Link>
        </div>

        <div className="crafts-gallery" aria-hidden="true">
          <div
            className="crafts-image crafts-image-primary"
            style={getCraftImageStyle(craftAssets[0])}
          />
          <div
            className="crafts-image crafts-image-secondary"
            style={getCraftImageStyle(craftAssets[1])}
          />
        </div>

        <Link
          className="button crafts-cta crafts-cta-mobile"
          href="/product-category/artesanato/"
        >
          Conhecer os artesanatos
        </Link>
      </div>
    </section>
  );
}

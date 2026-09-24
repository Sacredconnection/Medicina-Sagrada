"use client";

import Image from "next/image";
import { useState } from "react";
import type { WooImage } from "@/lib/types";

export function ProductGallery({ images, name }: { images: WooImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  const image = images[index];
  return <div className="product-gallery">{image ? <>
    <a href={image.src} target="_blank" rel="noopener noreferrer" className="product-main-image" aria-label={`Ampliar imagem ${index + 1} de ${name} (abre em nova aba)`}><Image src={image.src} alt={image.alt || name} width={900} height={900} sizes="(max-width: 800px) 100vw, 50vw" priority /><span>Ampliar imagem ↗</span></a>
    {images.length > 1 ? <div className="product-thumbnails" role="group" aria-label="Fotos do produto">{images.map((item, i) => <button key={`${item.id}-${i}`} aria-label={`Ver imagem ${i + 1} de ${name}`} aria-pressed={i === index} onClick={() => setIndex(i)}><Image src={item.thumbnail || item.src} alt="" width={80} height={80} /></button>)}</div> : null}
  </> : <div className="product-image product-image-large">Imagem indisponível</div>}</div>;
}

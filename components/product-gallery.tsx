"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { WooImage } from "@/lib/types";

export function ProductGallery({ images, name }: { images: WooImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [hasThumbnailOverflow, setHasThumbnailOverflow] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const image = images[index];

  useEffect(() => {
    const thumbnails = thumbnailsRef.current;
    if (!thumbnails) return;

    const updateOverflow = () => {
      setHasThumbnailOverflow(thumbnails.scrollWidth > thumbnails.clientWidth + 1);
    };

    updateOverflow();
    const resizeObserver = new ResizeObserver(updateOverflow);
    resizeObserver.observe(thumbnails);
    window.addEventListener("resize", updateOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [images.length]);

  return (
    <div className="product-gallery">
      {image ? (
        <>
          <a
            aria-label={`Ampliar imagem ${index + 1} de ${name} (abre em nova aba)`}
            className="product-main-image"
            href={image.src}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              priority
              alt={image.alt || name}
              height={900}
              sizes="(max-width: 800px) 100vw, 50vw"
              src={image.src}
              width={900}
            />
            <span>Ampliar imagem ↗</span>
          </a>
          {images.length > 1 ? (
            <>
              <div
                ref={thumbnailsRef}
                aria-label="Fotos do produto"
                className="product-thumbnails"
                role="group"
              >
                {images.map((item, imageIndex) => (
                  <button
                    aria-label={`Ver imagem ${imageIndex + 1} de ${name}`}
                    aria-pressed={imageIndex === index}
                    key={`${item.id}-${imageIndex}`}
                    onClick={() => setIndex(imageIndex)}
                  >
                    <Image
                      alt=""
                      height={80}
                      src={item.thumbnail || item.src}
                      width={80}
                    />
                  </button>
                ))}
              </div>
              <span
                aria-hidden="true"
                className={`scroll-hint product-thumbnails-scroll-hint${hasThumbnailOverflow ? " is-visible" : ""}`}
              >
                Deslize para ver mais
              </span>
            </>
          ) : null}
        </>
      ) : (
        <div className="product-image product-image-large">Imagem indisponível</div>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { WooImage } from "@/lib/types";
import { useProductVariation } from "@/components/product-variation-provider";

export function ProductGallery({ images, name }: { images: WooImage[]; name: string }) {
  const { variation } = useProductVariation();
  const initialIndex = Math.max(0, images.findIndex((image) => image.src === variation?.image?.src));
  return <ProductGalleryImages key={variation?.id ?? "default"} images={images} name={name} initialIndex={initialIndex} />;
}

function ProductGalleryImages({ images, name, initialIndex }: { images: WooImage[]; name: string; initialIndex: number }) {
  const [index, setIndex] = useState(initialIndex);
  const [hasThumbnailOverflow, setHasThumbnailOverflow] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const image = images[index];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isExpanded || !dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isExpanded]);

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
          <button
            type="button"
            aria-label={`Ampliar imagem ${index + 1} de ${name}`}
            aria-haspopup="dialog"
            className="product-main-image"
            onClick={() => setIsExpanded(true)}
          >
            <Image
              loading="eager"
              fetchPriority="high"
              alt={image.alt || name}
              height={900}
              sizes="(max-width: 600px) calc(100vw - 2rem), (max-width: 1344px) 50vw, 640px"
              src={image.src}
              width={900}
            />
            <span className="product-image-expand-hint" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
              </svg>
            </span>
          </button>
          <dialog
            ref={dialogRef}
            className="product-image-dialog"
            aria-label={`Imagem ampliada de ${name}`}
            onClose={() => {
              // A queued close event can arrive after the viewer is opened again.
              if (!dialogRef.current?.open) setIsExpanded(false);
            }}
            onCancel={(event) => {
              event.preventDefault();
              setIsExpanded(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Tab") {
                event.preventDefault();
                closeButtonRef.current?.focus();
              }
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) setIsExpanded(false);
            }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="product-image-dialog-close"
              aria-label="Fechar imagem ampliada"
              onClick={() => setIsExpanded(false)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
              <span>Fechar</span>
            </button>
            {isExpanded ? (
              <Image
                className="product-expanded-image"
                src={image.src}
                alt={image.alt || name}
                width={1600}
                height={1600}
                loading="eager"
                sizes="(max-width: 1120px) calc(100vw - 4rem), 1088px"
              />
            ) : null}
          </dialog>
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

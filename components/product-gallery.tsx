"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
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
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const thumbnailButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const image = images[index];

  const selectImage = (nextIndex: number) => {
    const imageCount = images.length;
    if (imageCount < 1) return;
    setIndex((nextIndex + imageCount) % imageCount);
  };

  const handleImageKeys = (event: KeyboardEvent<HTMLElement>) => {
    if (images.length < 2) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectImage(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      selectImage(index + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectImage(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectImage(images.length - 1);
    }
  };

  const handleThumbnailKeys = (event: KeyboardEvent<HTMLButtonElement>, imageIndex: number) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = imageIndex - 1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = imageIndex + 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = images.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const normalizedIndex = (nextIndex + images.length) % images.length;
    selectImage(normalizedIndex);
    thumbnailButtonRefs.current[normalizedIndex]?.focus();
    thumbnailButtonRefs.current[normalizedIndex]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

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
            aria-label={`Imagem ${index + 1} de ${images.length} de ${name}. Use as setas para trocar ou pressione Enter para ampliar.`}
            aria-haspopup="dialog"
            className="product-main-image"
            onClick={() => setIsExpanded(true)}
            onKeyDown={handleImageKeys}
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
            aria-label={`Imagem ampliada de ${name}. Use as setas para trocar de foto.`}
            onClose={() => {
              // A queued close event can arrive after the viewer is opened again.
              if (!dialogRef.current?.open) setIsExpanded(false);
            }}
            onCancel={(event) => {
              event.preventDefault();
              setIsExpanded(false);
            }}
            onKeyDown={handleImageKeys}
            onClick={(event) => {
              if (event.target === event.currentTarget) setIsExpanded(false);
            }}
          >
            <button
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
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  className="product-image-dialog-nav product-image-dialog-prev"
                  aria-label="Ver foto anterior"
                  onClick={() => selectImage(index - 1)}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="product-image-dialog-nav product-image-dialog-next"
                  aria-label="Ver próxima foto"
                  onClick={() => selectImage(index + 1)}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </>
            ) : null}
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
                aria-label="Fotos do produto. Use as setas para mudar de foto."
                className="product-thumbnails"
                role="group"
              >
                {images.map((item, imageIndex) => (
                  <button
                    aria-label={`Ver imagem ${imageIndex + 1} de ${name}`}
                    aria-pressed={imageIndex === index}
                    key={`${item.id}-${imageIndex}`}
                    onClick={() => setIndex(imageIndex)}
                    onKeyDown={(event) => handleThumbnailKeys(event, imageIndex)}
                    ref={(element) => { thumbnailButtonRefs.current[imageIndex] = element; }}
                    tabIndex={imageIndex === index ? 0 : -1}
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
              <span className="sr-only" aria-live="polite">
                Foto {index + 1} de {images.length}
              </span>
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

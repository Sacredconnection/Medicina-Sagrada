import Image from "next/image";

type IntentionCardMediaProps = {
  src: string;
  sizes: string;
  objectPosition?: string;
  loading: "eager" | "lazy";
};

export function IntentionCardMedia({ src, sizes, loading, objectPosition }: IntentionCardMediaProps) {
  return (
    <span className="intention-card-media" aria-hidden="true">
      <Image
        src={src}
        alt=""
        fill
        unoptimized={process.env.NODE_ENV === "development"}
        loading={loading}
        sizes={sizes}
        style={{ objectPosition }}
      />
    </span>
  );
}

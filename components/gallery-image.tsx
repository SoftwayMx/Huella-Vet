"use client";

import { useState } from "react";
import { Illustration, IllustrationVariant } from "./icons";

// Muestra la foto (si existe en /public/images) y, mientras no exista, un
// marcador de posición ilustrado. Al colocar el archivo con el nombre correcto,
// la foto aparece sin tocar código.
export function GalleryImage({
  src,
  alt,
  variant,
  aspect = "aspect-[4/3]",
}: {
  src: string;
  alt: string;
  variant: IllustrationVariant;
  aspect?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`${alt} (foto pendiente)`}
        className={`flex w-full items-center justify-center bg-teal-50 text-primary/60 ${aspect}`}
      >
        <Illustration variant={variant} className="h-16 w-16" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- fotos opcionales con marcador de posición si aún no existen
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`w-full object-cover ${aspect}`} />
  );
}

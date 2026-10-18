"use client";

import Link from "next/link";

const cls =
  "inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-primary bg-white px-4 py-2 text-base font-semibold text-primary transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1";

// Botón "Regresar" reutilizable. Si se pasa href → enlace; si no, botón con onClick.
export function BackLink({
  href,
  onClick,
  label = "Regresar",
}: {
  href?: string;
  onClick?: () => void;
  label?: string;
}) {
  const inner = (
    <>
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

import { ReactNode } from "react";

// Logo de huella (relleno, hereda currentColor).
export function PawLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <ellipse cx="12" cy="16.5" rx="4.2" ry="3.4" />
      <ellipse cx="5.2" cy="9.8" rx="1.7" ry="2.3" transform="rotate(-25 5.2 9.8)" />
      <ellipse cx="9.2" cy="6.6" rx="1.7" ry="2.3" transform="rotate(-8 9.2 6.6)" />
      <ellipse cx="14.8" cy="6.6" rx="1.7" ry="2.3" transform="rotate(8 14.8 6.6)" />
      <ellipse cx="18.8" cy="9.8" rx="1.7" ry="2.3" transform="rotate(25 18.8 9.8)" />
    </svg>
  );
}

function IconSvg({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS: Record<string, ReactNode> = {
  "consulta general": (
    <path d="M12 20.5S5 16 3.5 11.5C2 8 4 5.5 7 5.5c2 0 3.5 1.5 5 3.4 1.5-1.9 3-3.4 5-3.4 3 0 5 2.5 3.5 6C20.5 16 12 20.5 12 20.5z" />
  ),
  vacunación: <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" />,
  desparasitación: (
    <>
      <path d="M20 4C10 4 4 10 4 20c10 0 16-6 16-16z" />
      <path d="M4 20C8 14 12 9 20 6" />
    </>
  ),
  estética: <path d="M12 4l1.7 4.8L18.5 10l-4.8 1.2L12 16l-1.7-4.8L5.5 10l4.8-1.2L12 4z" />,
  "cirugía menor": (
    <>
      <rect x="3" y="9.5" width="18" height="5" rx="2.5" />
      <path d="M7 12h.01M12 12h.01M17 12h.01" />
    </>
  ),
  urgencias: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v9M7.5 12h9" />
    </>
  ),
};

const DEFAULT_ICON = (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </>
);

// Icono por servicio según su nombre; cae a un icono genérico si no coincide.
export function ServiceIcon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  return <IconSvg className={className}>{ICONS[name.toLowerCase()] ?? DEFAULT_ICON}</IconSvg>;
}

// Ilustraciones sencillas para los marcadores de posición de las fotos.
export type IllustrationVariant = "dog" | "cat" | "rabbit" | "clinic" | "team";

export function Illustration({
  variant,
  className = "h-16 w-16",
}: {
  variant: IllustrationVariant;
  className?: string;
}) {
  const common = { viewBox: "0 0 64 64", fill: "currentColor", className, "aria-hidden": true } as const;

  if (variant === "dog") {
    return (
      <svg {...common}>
        <ellipse cx="17" cy="16" rx="9" ry="12" />
        <ellipse cx="47" cy="16" rx="9" ry="12" />
        <circle cx="32" cy="40" r="20" />
      </svg>
    );
  }
  if (variant === "cat") {
    return (
      <svg {...common}>
        <path d="M16 20 L20 6 L32 15 Z" />
        <path d="M48 20 L44 6 L32 15 Z" />
        <circle cx="32" cy="40" r="20" />
      </svg>
    );
  }
  if (variant === "rabbit") {
    return (
      <svg {...common}>
        <ellipse cx="23" cy="14" rx="6" ry="16" />
        <ellipse cx="41" cy="14" rx="6" ry="16" />
        <circle cx="32" cy="42" r="18" />
      </svg>
    );
  }
  if (variant === "clinic") {
    return (
      <svg {...common}>
        <rect x="12" y="30" width="40" height="26" rx="3" />
        <path d="M32 14 L50 30 H14 Z" />
        <rect x="29" y="38" width="6" height="12" />
        <rect x="25" y="41" width="14" height="6" />
      </svg>
    );
  }
  // "team" → huella de la marca
  return (
    <svg {...common}>
      <ellipse cx="32" cy="40" rx="12" ry="9" />
      <ellipse cx="18" cy="24" rx="4.5" ry="6" transform="rotate(-25 18 24)" />
      <ellipse cx="28" cy="17" rx="4.5" ry="6" transform="rotate(-8 28 17)" />
      <ellipse cx="38" cy="17" rx="4.5" ry="6" transform="rotate(8 38 17)" />
      <ellipse cx="46" cy="24" rx="4.5" ry="6" transform="rotate(25 46 24)" />
    </svg>
  );
}

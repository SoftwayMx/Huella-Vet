import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Huella Vet — Citas para tu mascota",
  description:
    "Agenda, consulta y administra citas veterinarias en línea. Proyecto de portafolio de Softway MX (datos ficticios).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-surface text-ink antialiased">{children}</body>
    </html>
  );
}

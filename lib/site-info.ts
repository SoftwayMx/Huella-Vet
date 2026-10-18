// Información de contacto de la clínica. ⚠️ Datos FICTICIOS de ejemplo.
// No corresponden a teléfonos, correos ni direcciones reales.

export const SITE = {
  name: "Huella Vet",
  tagline: "Cuidamos la salud de tu mascota con amor y confianza.",
  phoneDisplay: "(55) 0000 0000",
  phoneTel: "+525500000000",
  whatsapp: `https://wa.me/5215500000000?text=${encodeURIComponent(
    "Hola, quiero agendar una cita en Huella Vet.",
  )}`,
  email: "contacto@huellavet.example",
  address:
    "Av. de los Veterinarios 123, Col. Centro, 06000 Ciudad de México (dirección de ejemplo)",
  // Retratos del equipo (asociación por nombre; sin foto se usan iniciales).
  vetPhotos: {
    "Dr. Luis Pérez": "/images/team/dr-luis-perez.jpg",
    "Dra. Ana García": "/images/team/dra-ana-garcia.jpg",
    "Dra. María López": "/images/team/dra-maria-lopez.jpg",
  } as Record<string, string>,
  hours: [
    { days: "Lunes a viernes", time: "9:00 – 19:00" },
    { days: "Sábado", time: "9:00 – 14:00" },
    { days: "Domingo", time: "Cerrado" },
  ],
};

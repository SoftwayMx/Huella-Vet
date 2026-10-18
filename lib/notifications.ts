// Capa desacoplada de notificaciones. Por ahora solo registra en consola los
// mensajes que se enviarían; la integración con correo/WhatsApp queda fuera de alcance.

export type NotificationType = "confirmacion" | "recordatorio" | "cancelacion";

export interface Notification {
  type: NotificationType;
  to: string; // destino (teléfono o correo)
  message: string;
}

function mask(to: string): string {
  if (!to) return to;
  if (to.includes("@")) {
    const [local, domain] = to.split("@");
    return `${local.slice(0, 2)}•••@${domain}`;
  }
  return to.length > 4 ? `••••${to.slice(-4)}` : "••••";
}

export function sendNotification(notification: Notification): void {
  // En producción aquí se conectaría el proveedor (correo/WhatsApp).
  // El destino se enmascara para no dejar datos personales en los logs.
  console.log(
    `[notificación:${notification.type}] → ${mask(notification.to)}: ${notification.message}`,
  );
}

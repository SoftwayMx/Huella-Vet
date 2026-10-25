# Brief — Huella Vet: sistema de citas para veterinaria

> Proyecto ficticio de portafolio de Softway MX. Todos los datos (nombres, teléfonos, direcciones, precios) son de ejemplo y deben marcarse como tal.

## Objetivo

Construir un sistema de citas en línea para una veterinaria pequeña: que los dueños de mascotas agenden sin llamar por teléfono y que el personal gestione la agenda sin dobles reservaciones.

## Público

- Dueños de mascotas, mayormente en celular, sin necesidad de crear cuenta.
- Personal de la clínica (administrador y recepción), en escritorio o tablet.

## Datos de ejemplo de la clínica

- Nombre: Huella Vet (ficticio).
- Zona horaria: America/Mexico_City.
- Horario: lunes a viernes 9:00–19:00, sábado 9:00–14:00, domingo cerrado.
- Veterinarios de ejemplo: tres, con horarios laborales y días de descanso distintos.
- Moneda: pesos mexicanos (MXN).

## Servicios de ejemplo

| Servicio | Precio (MXN) |
|---|---|
| Consulta general | 450 |
| Vacunación | 350 |
| Desparasitación | 250 |
| Estética | 500 |
| Cirugía menor | 1,800 |
| Urgencias | 800 |

Los servicios no tienen duración propia: toda cita ocupa un bloque fijo de 30 minutos.

## Alcance — cara pública

- Elegir servicio, veterinario (opcional) y un horario realmente disponible en un calendario fácil de usar en celular.
- Capturar datos del dueño (nombre, teléfono, correo) y de la mascota (nombre, especie, raza, edad, motivo de la consulta).
- Casilla de consentimiento y aviso de privacidad básico.
- Confirmación en pantalla con un código de cita.
- Consultar, reprogramar o cancelar la cita con el código y el teléfono, dentro de las reglas del negocio.

## Alcance — panel administrativo

- Inicio de sesión con roles: administrador y recepción.
- Agenda del día y de la semana; confirmar, reprogramar, cancelar y marcar citas como completadas o no asistió.
- Administración de servicios (nombre y precio) y de veterinarios (horarios y días de descanso).
- Bloqueo de fechas por vacaciones o festivos.
- Directorio de clientes y mascotas con historial de citas.
- Métricas simples: citas por día, por servicio y tasa de cancelación.
- Solo el administrador gestiona servicios, veterinarios y bloqueos; recepción gestiona citas y consulta el directorio.

## Reglas de negocio

- Cada cita ocupa un bloque fijo de 30 minutos; la disponibilidad se calcula con el horario del veterinario en bloques de 30 minutos.
- No se permiten dobles reservaciones ni traslapes; se valida en el servidor y también debe impedirlo la base de datos.
- Anticipación mínima para agendar: 2 horas.
- Cancelar o reprogramar solo hasta 4 horas antes de la cita.
- Estados: pendiente, confirmada, completada, cancelada, no asistió, con transiciones válidas definidas en el plan.
- Un cliente puede tener varias mascotas; una mascota, varias citas.
- Fechas en UTC en la base y en la zona horaria de la clínica en pantalla.

## Notificaciones

Capa desacoplada. Por ahora solo la interfaz y un registro en consola de los mensajes (confirmación, recordatorio, cancelación). Sin integrar correo ni WhatsApp todavía.

## Datos de ejemplo (seed)

Script con servicios, tres veterinarios con horarios, clientes, mascotas y citas ficticias en distintos estados, marcados como ejemplo.

## Diseño

- Limpio, amigable y confiable para una clínica veterinaria.
- Paleta de máximo cinco colores definidos como variables.
- Mobile-first, accesible (labels, foco visible, contraste, teclado).
- Estados claros de carga, vacío y error.
- Calendario de horarios propio y sencillo, sin librerías pesadas.

## Fuera de alcance

Pagos en línea, historial clínico o expediente médico, duración variable por servicio, integración real con correo o WhatsApp, app móvil nativa, multi-sucursal.

## Criterios de aceptación

- Un dueño puede agendar, consultar, reprogramar y cancelar una cita sin crear cuenta.
- Es imposible reservar un horario ocupado o fuera del horario laboral, aunque se manipule la petición.
- El panel respeta los permisos por rol.
- Hay pruebas automáticas para disponibilidad, transiciones de estado y permisos por rol.
- Lint, pruebas y build pasan sin errores.
- `DELIVERY.md` documenta cómo levantar, sembrar datos y qué quedó pendiente.

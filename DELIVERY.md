# DELIVERY.md — Huella Vet

Sistema de citas para una veterinaria ficticia, proyecto de portafolio de Softway MX. Todos los datos (nombres, teléfonos, precios) son de ejemplo y están marcados como ficticios.

## Resumen

Aplicación Next.js (App Router + TypeScript + Tailwind CSS) con Supabase como base de datos y autenticación, **sin backend separado**: la lógica de servidor vive en route handlers (cara pública) y server actions (panel).

- **Cara pública** (sin cuenta): agendar, consultar, reprogramar y cancelar una cita con código + teléfono.
- **Panel** (Supabase Auth, roles admin/recepción): agenda del día/semana, gestión de estados de citas, directorio de clientes con historial, métricas y administración de servicios, veterinarios y bloqueos (solo admin).
- **Base de datos** definida por migraciones SQL versionadas, con RLS por rol y restricción de exclusión anti-traslape.

## Stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4.
- Supabase (PostgreSQL + Auth). Cliente `@supabase/supabase-js` y `@supabase/ssr`.
- Zod (validación), date-fns + date-fns-tz (fechas), Vitest (pruebas).
- Sin ORM, sin librerías de calendario, sin servicios externos de rate-limit.

Fechas: se guardan en UTC (`timestamptz`) y se muestran en `America/Mexico_City`. Convención de días: `0=domingo … 6=sábado`.

## Cómo levantar en local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env.local a partir de .env.example
cp .env.example .env.local
# y completar las tres variables (ver abajo)

# 3. Desarrollo
npm run dev        # http://localhost:3000

# 4. Producción
npm run build && npm run start
```

## Base de datos: migraciones y seed

Las migraciones están en `migrations/` y se aplican en el proyecto de Supabase. No hay Postgres local configurado, por lo que **no se pudieron ejecutar ni verificar contra una base real** (ver Pendientes).

1. Abrir el SQL Editor de Supabase y ejecutar `migrations/0001_init.sql` (crea tablas, restricciones, la restricción de exclusión, RLS y la función `rate_limit_hit`).
2. Ejecutar `migrations/seed.sql` **una sola vez** sobre la base ya migrada (carga servicios, 3 veterinarios con horarios, clientes, mascotas y 6 citas de ejemplo en distintos estados).

Alternativa con CLI de Supabase (no instalada en este entorno): `supabase db push`.

> La restricción de exclusión requiere la extensión `btree_gist`; la migración la crea con `create extension if not exists`.

## Variables de entorno

| Variable | Dónde | Notas |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | navegador + servidor | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | navegador + servidor | clave pública (anon); segura solo por la RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo servidor** | clave de servicio; **nunca** en el navegador |

`SUPABASE_SERVICE_ROLE_KEY` se usa únicamente en los route handlers públicos del servidor (`lib/supabase/server.ts` → `createServiceClient`). No se importa en ningún componente de cliente.

## Bootstrap del personal (staff)

`staff` vincula un usuario de Supabase Auth con un rol. El seed **no puede** insertar en `auth.users` (esquema gestionado por Supabase), así que se hace a mano:

1. Supabase Dashboard → Authentication → Users → **Add user** (correo + contraseña).
2. Copiar el UUID del usuario.
3. En el SQL Editor:

```sql
insert into public.staff (id, name, role) values
  ('<uuid-del-usuario>', 'Nombre del administrador', 'admin');
```

Roles válidos: `admin`, `recepcion`. El panel verifica el rol en servidor en cada operación.

## Dependencias agregadas (y por qué)

Runtime: `next`, `react`, `react-dom`, `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `date-fns`, `date-fns-tz`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`.

- `@supabase/ssr` — gestión de cookies de sesión en App Router; el JWT del usuario autenticado fluye a Supabase y la RLS se aplica de verdad en el panel.
- `zod` — validación estricta de toda entrada en el servidor (pedida en el brief).
- `date-fns` + `date-fns-tz` — fechas en UTC con conversión a `America/Mexico_City` (`fromZonedTime`, `formatInTimeZone`).

Dev: `typescript`, `@types/*`, `eslint`, `eslint-config-next`, `vitest`.

No se agregó nada más. El rate-limit se implementa con una tabla en Postgres (sin servicio externo); el selector de horarios es propio (sin librería de calendario).

## Reglas de negocio implementadas

- Bloque fijo de 30 min por cita (`check end_at = start_at + interval '30 minutes'`).
- Disponibilidad calculada a partir del horario del veterinario, días de descanso y bloqueos de fecha (`lib/availability.ts`).
- Anti-traslape en dos capas: validación en servidor + restricción de exclusión de Postgres por veterinario y rango (`appointments_no_overlap`, `cancelada` libera el bloque).
- Anticipación mínima para agendar: 2 horas (`canBook`).
- Cancelar/reprogramar solo hasta 4 horas antes (`canCancelOrReprogram`) — en la cara pública.
- Estados `pendiente → confirmada → {completada, no_asistio, cancelada}`; terminales sin salidas (`lib/transitions.ts`).
- Código de cita de 8 caracteres (alfabeto sin caracteres ambiguos, ~1.1e12 combinaciones) con `crypto` (`lib/appointment-code.ts`); la consulta pública exige también el teléfono.
- Reprogramar conserva el veterinario y exige un bloque libre.

**Decisión de negocio**: el personal puede cancelar/reprogramar sin el límite de 4 h (la agenda necesita absorber imprevistos); la reprogramación del panel sí exige un bloque disponible. El límite de 4 h se aplica al autoservicio público.

## Seguridad (revisión manual)

- **Secretos**: solo en variables de entorno; `.env.example` sin valores reales. Clave de servicio solo en servidor.
- **Validación de entrada**: esquemas Zod para toda entrada pública (`lib/validation/public.ts`) y del panel (`lib/validation/admin.ts`).
- **Inyección SQL**: cero concatenación; todo con el cliente de Supabase (parametrizado) o la función `rate_limit_hit` (parámetros `$1..$4`).
- **Autorización por rol**: verificación en servidor en cada server action (`getStaff` + chequeo `role === 'admin'`); además, la RLS restringe escritura de catálogos a admin y lectura a staff.
- **RLS**: activada en las 10 tablas; anónimo sin acceso directo (solo vía endpoints que validan).
- **Rate-limit**: en los endpoints públicos de agendar y consultar (y también disponibilidad/servicios/veterinarios), con ventana fija y contador atómico en Postgres.
- **Mensajes de error**: genéricos; no se filtran detalles internos de Supabase/Postgres.
- **Datos personales fuera de logs y respuestas públicas**: las notificaciones enmascaran el destino (`••••0000` / `ab•••@dominio`); la consulta pública devuelve solo lo mínimo (sin exponer correo del cliente).
- **CORS**: no aplica CORS entre orígenes; la app es same-origin (páginas y API en el mismo dominio). Para separar dominios habría que restringir `Allowed-Origins` en Supabase.

## Accesibilidad

- Labels asociados (`htmlFor`/`id`) en todos los campos; checkbox de consentimiento con `<label>`.
- Foco visible (`focus-visible:ring-2`) en botones, inputs, links y slots.
- Contraste: paleta de 5 colores (teal/ámbar/superficie/tinta) con texto blanco sobre `#0f766e`.
- Estados de carga (`Spinner`), vacío y error (`role="alert"`) en todas las vistas que consultan datos.
- Navegación por teclado: todo es `<button>`/`<a>`/inputs nativos; progreso del wizard con `aria-current`.
- Selector de fechas con `<input type="date">` nativo (funciona bien en móvil) + flechas.

## Rendimiento

- Páginas públicas prerenderizadas estáticamente; panel y API dinámicos (por sesión).
- Sin librerías pesadas en el cliente; fuentes del sistema; sin imágenes.
- La disponibilidad consulta por veterinario de forma secuencial (≤ 3 veterinarios → unas 12 consultas); suficiente para la escala de una clínica. *Ceiling conocido: si hubiera muchos veterinarios, paralelizar con `Promise.all`.*

## Sitio público

La portada (`/`) incluye cabecera con logo y navegación, hero, sección de servicios (leídos de la BD), sección de veterinarios (leídos de la BD), galería con marcadores de posición, "cómo funciona" en 3 pasos y sección de contacto. Se añadieron `/contacto`, `/aviso-de-privacidad` y `/terminos`, con cabecera/pie compartidos (route group `(public)`) y botón "Regresar" reutilizable (`components/back-link.tsx`).

### Imágenes

Las imágenes del sitio son **de ejemplo, generadas con IA** (las personas y mascotas no son reales). Viven en `public/images/`:

- `gallery/` — seis fotos (~420×314) para la galería "Nuestro espacio".
- `hero/portada.jpg` — imagen de fondo de la sección principal (1376×768).
- `team/` — tres retratos cuadrados (592×592) de los veterinarios.
- `contact/mapa-ejemplo.svg` — mapa ilustrado temporal (1200×450).

Para reemplazarlas por fotos reales basta con sustituir los archivos conservando el mismo nombre, o actualizar el mapa de fotos del equipo en `lib/site-info.ts` (`SITE.vetPhotos`). La carpeta original `huella-vet-imagenes/` no se sube al repositorio (está en `.gitignore`).

## Nota legal

El aviso de privacidad (`/aviso-de-privacidad`) y los términos de uso (`/terminos`) son **textos de ejemplo** redactados para un proyecto de portafolio. **Deben ser revisados por un abogado antes de usarse con un cliente real.**

## Checks corridos

| Check | Comando | Resultado |
|---|---|---|
| Typecheck | `npm run typecheck` | ✅ |
| Lint | `npm run lint` | ✅ 0 errores, 0 warnings |
| Pruebas | `npm test` | ✅ 18/18 |
| Build | `npm run build` | ✅ |

Pruebas (`tests/`): disponibilidad (8: sin horario, descanso, bloqueo de día, bloques de 30 min, cita ocupada, bordes sin traslape, anticipación 2 h, bloqueo parcial, bloqueos de otras fechas), transiciones (máquina de estados + reglas 2 h/4 h) y permisos (matriz admin vs recepción).

## Pendientes / limitaciones conocidas

1. **E2E pendiente sobre la base real**: el proyecto ya está vinculado a Supabase (`supabase/`) y la base está migrada y con seed (verifiqué que `services` y `veterinarians` responden correctamente). Aún no se probaron en vivo: la restricción de exclusión, la RLS, el rate-limit, el login y el flujo completo de agendar/consultar.
2. **Bootstrap de staff** manual (ver arriba).
3. **`npm audit`**: 5 avisos *high* proceden de una sola cadena dev-only (`braces` → `micromatch` → `fast-glob` → `@next/eslint-plugin-next` → `eslint-config-next`), sin versión corregida publicada y sin impacto en runtime (DoS de tooling de lint local). Aceptado; el "fix" sugerido degrada a `eslint-config-next@14` (EOL) y no elimina el aviso.
4. **Soft-delete de servicios/veterinarios**: se desactivan (`is_active=false`) para conservar historial; el `unique` sobre `name` impide recrear el mismo nombre — renombrar o reutilizar el registro existente.
5. **Reprogramar del panel** usa el mismo `SlotPicker` público, por lo que aplica la anticipación de 2 h también al personal.

# CLAUDE.md — Boilerplate Fullstack (Next.js + FastAPI)

Reglas generales de trabajo para este proyecto. Todo lo específico del cliente o del proyecto (alcance, reglas de negocio, estilo, textos, datos) vive en `brief.md`. Si algo de `brief.md` contradice este archivo, manda `brief.md`.

## Stack

- Frontend: Next.js (React) con Tailwind CSS, en la carpeta `frontend/`.
- Backend: FastAPI (Python), en la carpeta `backend/`.
- Base de datos: PostgreSQL pensada para Supabase, con migraciones SQL versionadas en el repo (`backend/migrations/`).
- Cada parte maneja sus propias dependencias (`package.json` en el frontend, `requirements.txt` y `requirements-dev.txt` en el backend).
- No agregues dependencias nuevas sin necesidad real; si sumas una, justifícala en `DELIVERY.md`.

## Estructura

- `frontend/` — app Next.js (rutas públicas y panel privado).
- `backend/` — API FastAPI, modelos, esquemas, servicios y pruebas.
- `docs/roles/` — prompts de Planner, Developer y Reviewer.
- `scripts/` — utilidades del proyecto (por ejemplo `cost_tracker.py`).
- `config/` — configuración (por ejemplo `model_prices.json`).
- `costs/` — historial de costos acumulado.
- `brief.md`, `PLAN.md`, `DELIVERY.md`, `REVIEW.md` — documentos del flujo de trabajo, en la raíz.

## Flujo de trabajo

1. Planner (sesión nueva): lee `brief.md` y genera `PLAN.md` con modelo de datos, endpoints, estructura de carpetas y pasos. No escribe código.
2. Developer: construye siguiendo `PLAN.md` por pasos, avisando al terminar cada uno, y al final genera `DELIVERY.md`.
3. Reviewer (sesión nueva, solo lectura): compara `DELIVERY.md` contra el código real y contra `brief.md` y `PLAN.md`, y genera `REVIEW.md` con veredicto.
4. Revisión humana antes de producción. No hay Debugger formal: los bugs se resuelven con órdenes directas.

No avances de un paso al siguiente sin mi visto bueno cuando el flujo lo pida.

## Convenciones

- Código, nombres de variables, funciones y archivos en inglés; textos visibles para el usuario, comentarios de negocio y documentación en español.
- Backend: tipado con type hints, esquemas Pydantic para toda entrada y salida, lógica de negocio en una capa de servicios (no en los routers), errores con códigos HTTP correctos.
- Frontend: componentes pequeños y reutilizables, estados de carga, vacío y error en toda vista que consulte datos, mobile-first.
- Fechas: guardar en UTC, mostrar en la zona horaria definida en `brief.md`.
- Commits pequeños y descriptivos; no hagas commit de `.env`, claves ni datos reales.

## Qué hacer

- Leer `brief.md` completo antes de empezar.
- Validar en el backend todo lo que importe (permisos, disponibilidad, estados), nunca solo en la interfaz.
- Escribir pruebas automáticas para la lógica crítica definida en el brief.
- Revisar los scripts disponibles (`package.json`, `Makefile`, `pyproject`) antes de correr cualquier comando.
- Decir claramente lo que no pudiste verificar y dejarlo como pendiente.

## Qué NO hacer

- No inventar comandos, endpoints, datos reales de negocios, teléfonos ni direcciones.
- No agregar dependencias solo para pasar checks.
- No poner secretos, claves ni URLs privadas en el código ni en el repositorio.
- No afirmar que algo funciona si no lo corriste.
- No tocar la arquitectura ni el alcance por tu cuenta; si hace falta, pregunta.

## Seguridad

Aplica estas prácticas de forma manual durante el desarrollo; no hay escáneres automáticos configurados en este proyecto.

- Secretos solo en variables de entorno, con un `.env.example` completo y sin valores reales.
- Validación estricta de entradas con esquemas en el backend.
- Consultas parametrizadas o ORM; nunca concatenar SQL con datos del usuario.
- Contraseñas con hash (o el servicio de autenticación de Supabase); autorización por rol verificada en cada endpoint privado.
- CORS restringido a los orígenes necesarios.
- Límite de peticiones en los endpoints públicos.
- Mensajes de error que no filtren detalles internos; datos personales fuera de logs y de respuestas públicas.
- Antes de entregar, haz una revisión manual de estos puntos y anota el resultado en `DELIVERY.md`.

## Checks antes de entregar

Revisa primero qué scripts existen y corre, según aplique: lint, pruebas y build del frontend; lint y pruebas del backend. Si algo falla por tus propios cambios, corrígelo. Si una suite de pruebas todavía no existe, omite ese check y avísalo. No agregues dependencias solo para poder correr los checks.

## Costos

Al terminar cada turno, el hook `Stop` corre `scripts/cost_tracker.py`, que lee el transcript, calcula el costo con `config/model_prices.json` y acumula en `costs/historial.json`. Para consultar el acumulado: `python3 scripts/cost_tracker.py --resumen`. Si lo pruebas a mano, usa `< /dev/null` para que no se quede esperando el pipe del hook.

## Despliegue

- Mientras sea proyecto de portafolio: ramas de Git, sin proyecto de staging separado.
- El deploy es manual, hecho por mí desde la carpeta local; no configures CI/CD automático.
- Antes de producción hay revisión humana mía.

## Entregables

Al terminar, genera `DELIVERY.md` con: qué construiste, cómo levantar el proyecto en local, cómo cargar el seed, variables de entorno necesarias, dependencias agregadas y por qué, checks corridos con su resultado, revisión manual de seguridad y pendientes.

-- ============================================================================
-- Huella Vet — Datos de ejemplo (SEED)
-- ⚠️ FICTICIO: nombres, teléfonos, correos y fechas son de ejemplo.
--    No corresponden a personas ni a información real.
-- Ejecutar UNA sola vez sobre la base ya migrada (o vacía).
-- Nota: el personal (staff) se crea en Supabase Auth; no se puede sembrar
--       auth.users desde SQL. Véase DELIVERY.md.
-- ============================================================================

-- Servicios (precios MXN de ejemplo)
insert into public.services (name, price) values
  ('Consulta general', 450),
  ('Vacunación', 350),
  ('Desparasitación', 250),
  ('Estética', 500),
  ('Cirugía menor', 1800),
  ('Urgencias', 800)
on conflict (name) do nothing;

-- Veterinarios (ficticios)
insert into public.veterinarians (name) values
  ('Dra. Ana García'),
  ('Dr. Luis Pérez'),
  ('Dra. María López')
on conflict (name) do nothing;

-- Horarios laborales (0=domingo .. 6=sábado). Sin fila = día de descanso recurrente.
insert into public.vet_schedules (veterinarian_id, day_of_week, start_time, end_time)
select v.id, s.dow, s.start_time::time, s.end_time::time
from public.veterinarians v
join (values
  ('Dra. Ana García',  1, '09:00', '19:00'),
  ('Dra. Ana García',  2, '09:00', '19:00'),
  ('Dra. Ana García',  3, '09:00', '19:00'),
  ('Dra. Ana García',  4, '09:00', '19:00'),
  ('Dra. Ana García',  5, '09:00', '19:00'),
  ('Dra. Ana García',  6, '09:00', '14:00'),
  ('Dr. Luis Pérez',   1, '13:00', '19:00'),
  ('Dr. Luis Pérez',   2, '13:00', '19:00'),
  ('Dr. Luis Pérez',   4, '13:00', '19:00'),
  ('Dr. Luis Pérez',   5, '13:00', '19:00'),
  ('Dr. Luis Pérez',   6, '09:00', '14:00'),
  ('Dra. María López', 1, '09:00', '14:00'),
  ('Dra. María López', 2, '09:00', '14:00'),
  ('Dra. María López', 4, '09:00', '14:00'),
  ('Dra. María López', 5, '09:00', '14:00'),
  ('Dra. María López', 6, '09:00', '14:00')
) as s(name, dow, start_time, end_time) on s.name = v.name
on conflict (veterinarian_id, day_of_week) do nothing;

-- Descansos puntuales (ejemplo)
insert into public.vet_days_off (veterinarian_id, date, reason)
select v.id, d.date, d.reason
from public.veterinarians v
join (values
  ('Dra. Ana García',   ((now() at time zone 'America/Mexico_City')::date + 10), 'Capacitación (ejemplo)'),
  ('Dra. María López',  ((now() at time zone 'America/Mexico_City')::date + 12), 'Asunto personal (ejemplo)')
) as d(name, date, reason) on d.name = v.name
on conflict (veterinarian_id, date) do nothing;

-- Bloqueos de fechas de la clínica (ejemplo)
insert into public.blocked_dates (date, start_time, end_time, reason) values
  ('2026-12-25', null, null, 'Navidad (festivo, ejemplo)'),
  ('2026-11-02', null, null, 'Festivo (ejemplo)'),
  (((now() at time zone 'America/Mexico_City')::date) + 20, null, null, 'Cierre por inventario (ejemplo)');

-- Clientes (ficticios)
insert into public.clients (name, phone, email) values
  ('María Hernández', '5512340001', 'maria.ejemplo@correo.com'),
  ('Juan Ramírez',    '5512340002', 'juan.ejemplo@correo.com'),
  ('Sofía Torres',    '5512340003', null),
  ('Carlos Mendoza',  '5512340004', 'carlos.ejemplo@correo.com');

-- Mascotas (ficticias)
insert into public.pets (client_id, name, species, breed, age) values
  ((select id from public.clients where phone = '5512340001'), 'Luna',   'Perro',  'Mestizo',        '3 años'),
  ((select id from public.clients where phone = '5512340001'), 'Rocky',  'Perro',  'Labrador',       '2 años'),
  ((select id from public.clients where phone = '5512340002'), 'Michi',  'Gato',   'Siamés',         '1 año'),
  ((select id from public.clients where phone = '5512340003'), 'Nube',   'Conejo', 'Enano',          '6 meses'),
  ((select id from public.clients where phone = '5512340004'), 'Thor',   'Perro',  'Pastor alemán',  '4 años'),
  ((select id from public.clients where phone = '5512340004'), 'Pelusa', 'Gato',   'Persa',          '5 años');

-- Citas en distintos estados (ejemplo). Los horarios son relativos a la fecha de
-- ejecución, por lo que algunas pueden caer fuera del horario del veterinario
-- (solo afecta a la demo visual, no a la integridad de los datos).
insert into public.appointments
  (code, client_id, pet_id, service_id, veterinarian_id, start_at, end_at, status, reason, consent)
values
  ('DEMOA001',
   (select id from public.clients where phone = '5512340001'),
   (select id from public.pets where name = 'Luna'),
   (select id from public.services where name = 'Consulta general'),
   (select id from public.veterinarians where name = 'Dra. Ana García'),
   (((now() at time zone 'America/Mexico_City')::date) - interval '3 days' + time '10:00') at time zone 'America/Mexico_City',
   (((now() at time zone 'America/Mexico_City')::date) - interval '3 days' + time '10:30') at time zone 'America/Mexico_City',
   'completada', 'Revisión de rutina (ejemplo)', true),

  ('DEMOA002',
   (select id from public.clients where phone = '5512340002'),
   (select id from public.pets where name = 'Michi'),
   (select id from public.services where name = 'Vacunación'),
   (select id from public.veterinarians where name = 'Dr. Luis Pérez'),
   (((now() at time zone 'America/Mexico_City')::date) - interval '2 days' + time '11:00') at time zone 'America/Mexico_City',
   (((now() at time zone 'America/Mexico_City')::date) - interval '2 days' + time '11:30') at time zone 'America/Mexico_City',
   'no_asistio', 'Primera dosis (ejemplo)', true),

  ('DEMOA003',
   (select id from public.clients where phone = '5512340003'),
   (select id from public.pets where name = 'Nube'),
   (select id from public.services where name = 'Estética'),
   (select id from public.veterinarians where name = 'Dra. María López'),
   (((now() at time zone 'America/Mexico_City')::date) - interval '1 day' + time '12:00') at time zone 'America/Mexico_City',
   (((now() at time zone 'America/Mexico_City')::date) - interval '1 day' + time '12:30') at time zone 'America/Mexico_City',
   'cancelada', 'Corte y limpieza (ejemplo)', true),

  ('DEMOA004',
   (select id from public.clients where phone = '5512340001'),
   (select id from public.pets where name = 'Rocky'),
   (select id from public.services where name = 'Desparasitación'),
   (select id from public.veterinarians where name = 'Dra. Ana García'),
   (((now() at time zone 'America/Mexico_City')::date) + interval '1 day' + time '09:00') at time zone 'America/Mexico_City',
   (((now() at time zone 'America/Mexico_City')::date) + interval '1 day' + time '09:30') at time zone 'America/Mexico_City',
   'pendiente', 'Desparasitación trimestral (ejemplo)', true),

  ('DEMOA005',
   (select id from public.clients where phone = '5512340004'),
   (select id from public.pets where name = 'Thor'),
   (select id from public.services where name = 'Cirugía menor'),
   (select id from public.veterinarians where name = 'Dr. Luis Pérez'),
   (((now() at time zone 'America/Mexico_City')::date) + interval '2 days' + time '13:00') at time zone 'America/Mexico_City',
   (((now() at time zone 'America/Mexico_City')::date) + interval '2 days' + time '13:30') at time zone 'America/Mexico_City',
   'confirmada', 'Limpieza dental (ejemplo)', true),

  ('DEMOA006',
   (select id from public.clients where phone = '5512340004'),
   (select id from public.pets where name = 'Pelusa'),
   (select id from public.services where name = 'Consulta general'),
   (select id from public.veterinarians where name = 'Dra. María López'),
   (((now() at time zone 'America/Mexico_City')::date) + interval '3 days' + time '09:30') at time zone 'America/Mexico_City',
   (((now() at time zone 'America/Mexico_City')::date) + interval '3 days' + time '10:00') at time zone 'America/Mexico_City',
   'pendiente', 'Revisión general (ejemplo)', true)
on conflict (code) do nothing;

import { BackLink } from "@/components/back-link";

export const metadata = { title: "Aviso de privacidad — Huella Vet" };

export default function AvisoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <BackLink href="/" />

      <h1 className="mt-6 text-3xl font-bold text-ink">Aviso de privacidad</h1>
      <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        ⚠️ Documento de ejemplo para un proyecto de portafolio. No constituye asesoría legal y debe ser
        revisado por un abogado antes de usarse con un cliente real.
      </p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-ink">1. Responsable del tratamiento</h2>
          <p className="mt-1">
            <strong>Huella Vet</strong> (nombre ficticio de ejemplo), con domicilio en Av. de los
            Veterinarios 123, Col. Centro, 06000 Ciudad de México, es el responsable del tratamiento de
            tus datos personales, en términos de la Ley Federal de Protección de Datos Personales en
            Posesión de los Particulares (LFPDPPP) y su Reglamento. Correo de contacto: contacto@huellavet.example.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">2. Datos personales que recabamos</h2>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            <li>Del dueño de la mascota: nombre, teléfono y correo (opcional).</li>
            <li>De la mascota: nombre, especie, raza (opcional), edad (opcional) y motivo de la consulta (opcional).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">3. Finalidades del tratamiento</h2>
          <p className="mt-1"><strong>Finalidades necesarias</strong> (sin las cuales no podemos prestarte el servicio):</p>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            <li>Agendar, confirmar, reprogramar y cancelar tu cita.</li>
            <li>Generar tu código de cita y llevar el historial de citas del cliente.</li>
            <li>Contactarte en relación con la cita que agendaste.</li>
          </ul>
          <p className="mt-2"><strong>Finalidades opcionales</strong> (puedes oponerte):</p>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            <li>Enviarte recordatorios y avisos sobre tu cita.</li>
            <li>Mejorar la calidad de nuestros servicios.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">4. Opciones para limitar el uso o la divulgación</h2>
          <p className="mt-1">
            Puedes no proporcionar los datos marcados como opcionales (correo, raza, edad, motivo) y
            solicitar que solo te contactemos para lo estrictamente necesario, a través de los medios
            indicados en el punto 5.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">5. Derechos ARCO</h2>
          <p className="mt-1">
            Tienes derecho a <strong>acceder, rectificar, cancelar</strong> tus datos y a{" "}
            <strong>oponerte</strong> a su tratamiento (derechos ARCO). Para ejercerlos, escribe a
            contacto@huellavet.example o llama al (55) 0000 0000, indicando tu nombre, teléfono y la
            solicitud. Atenderemos tu petición en los plazos previstos por la ley.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">6. Transferencias de datos</h2>
          <p className="mt-1">
            No transferimos tus datos personales a terceros, salvo cuando sea necesario para la prestación
            del servicio o por requerimiento de autoridad competente, en los términos que establece la ley.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">7. Cambios a este aviso</h2>
          <p className="mt-1">
            Cualquier cambio a este aviso se publicará en esta misma página, actualizando la fecha de
            última actualización.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">8. Última actualización</h2>
          <p className="mt-1">18 de octubre de 2026.</p>
        </section>
      </div>
    </div>
  );
}

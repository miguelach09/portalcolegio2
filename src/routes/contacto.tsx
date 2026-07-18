import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contáctenos — Colegio Cafam" },
      { name: "description", content: "Datos de contacto del Colegio Cafam: dirección, teléfonos, correo y horarios de atención." },
      { property: "og:title", content: "Contáctenos — Colegio Cafam" },
      { property: "og:description", content: "Estamos para atender tus consultas." },
      { property: "og:url", content: "/contacto" },
    ],
    links: [{ rel: "canonical", href: "/contacto" }],
  }),
  component: Contacto,
});

function Contacto() {
  return (
    <PageShell>
      <PageHero eyebrow="Contáctenos" title="Estamos para escucharte." subtitle="Escríbenos, llámanos o visítanos. Nuestro equipo estará encantado de atenderte." />
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display text-2xl font-bold">Envíanos un mensaje</h2>
            <form className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="font-medium">Nombre</span>
                  <input required className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </label>
                <label className="text-sm">
                  <span className="font-medium">Correo</span>
                  <input required type="email" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </label>
              </div>
              <label className="text-sm">
                <span className="font-medium">Asunto</span>
                <input className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
              </label>
              <label className="text-sm">
                <span className="font-medium">Mensaje</span>
                <textarea rows={5} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
              </label>
              <button type="submit" className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 transition-transform">
                Enviar mensaje
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {[
              { icon: MapPin, title: "Dirección", value: "Av. Cra. 68 No. 90-88, Bogotá, Colombia" },
              { icon: Phone, title: "Teléfono", value: "(601) 307 8060" },
              { icon: Mail, title: "Correo", value: "info@portalcolegio.com" },
              { icon: Clock, title: "Horario de atención", value: "Lunes a viernes, 7:00 a.m. – 4:00 p.m." },
            ].map(({ icon: Icon, title, value }) => (
              <div key={title} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
              </div>
            ))}
            <div className="overflow-hidden rounded-2xl border border-border">
              <iframe
                title="Ubicación Colegio Cafam"
                src="https://www.google.com/maps?q=Colegio+Cafam+Bogota&output=embed"
                className="h-64 w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

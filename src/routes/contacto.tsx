import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { MapPin, Phone, Mail, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { submitContactMessage } from "@/lib/features.functions";

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
  const submit = useServerFn(submitContactMessage);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await submit({ data: { values: form } });
      setStatus("done");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <PageShell>
      <PageHero eyebrow="Contáctenos" title="Estamos para escucharte." subtitle="Escríbenos, llámanos o visítanos. Nuestro equipo estará encantado de atenderte." />
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Envíanos un mensaje</h2>

            {status === "done" ? (
              <div className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-green-soft p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-brand" />
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">¡Mensaje enviado!</h3>
                <p className="text-sm text-muted-foreground">
                  Gracias por escribirnos. Te responderemos a la brevedad.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-2 rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="font-medium text-slate-900 dark:text-white">Nombre</span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      maxLength={100}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="font-medium text-slate-900 dark:text-white">Correo</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      maxLength={255}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </label>
                </div>
                <label className="text-sm">
                  <span className="font-medium text-slate-900 dark:text-white">Asunto</span>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    maxLength={200}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="text-sm">
                  <span className="font-medium text-slate-900 dark:text-white">Mensaje</span>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    maxLength={2000}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </label>
                {status === "error" && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    No se pudo enviar el mensaje. Intenta de nuevo.
                  </div>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 transition-transform disabled:opacity-60"
                >
                  {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {status === "loading" ? "Enviando..." : "Enviar mensaje"}
                </button>
              </form>
            )}
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
                  <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
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

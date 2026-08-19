import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { HeartHandshake, Brain, Users, Sparkles } from "lucide-react";

const areas = [
  { icon: Brain, title: "Psicología", text: "Acompañamiento emocional y desarrollo integral de nuestros estudiantes." },
  { icon: HeartHandshake, title: "Enfermería", text: "Atención primaria en salud y seguimiento a la comunidad educativa." },
  { icon: Users, title: "Trabajo social", text: "Apoyo a familias y programas de fortalecimiento comunitario." },
  { icon: Sparkles, title: "Convivencia", text: "Estrategias de mediación, resolución de conflictos y sana convivencia." },
];

export const Route = createFileRoute("/bienestar")({
  head: () => ({
    meta: [
      { title: "Bienestar — Colegio Cafam" },
      { name: "description", content: "Programas de bienestar del Colegio Cafam: psicología, enfermería, trabajo social y convivencia." },
      { property: "og:title", content: "Bienestar — Colegio Cafam" },
      { property: "og:description", content: "Programas de bienestar del Colegio Cafam: psicología, enfermería, trabajo social y convivencia escolar para acompañar el desarrollo integral de estudiantes y familias." },
      { property: "og:url", content: "https://connecteducafam.lovable.app/bienestar" },
    ],
    links: [{ rel: "canonical", href: "https://connecteducafam.lovable.app/bienestar" }],
  }),
  component: Bienestar,
});

function Bienestar() {
  return (
    <PageShell>
      <PageHero eyebrow="Bienestar" title="Cuidamos a nuestra comunidad." subtitle="Programas y servicios que acompañan el desarrollo integral de estudiantes y familias." />
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          {areas.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-brand/15 text-green-brand">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold">{title}</h2>
              <p className="mt-3 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

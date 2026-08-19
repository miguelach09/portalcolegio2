import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import lib from "@/assets/gallery-library.jpg";
import { BookOpen, Search, Globe, Users } from "lucide-react";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca — Colegio Cafam" },
      { name: "description", content: "Biblioteca del Colegio Cafam: recursos, bases de datos y espacios de lectura para toda la comunidad." },
      { property: "og:title", content: "Biblioteca — Colegio Cafam" },
      { property: "og:description", content: "Recursos y espacios de lectura." },
      { property: "og:url", content: "/biblioteca" },
    ],
    links: [{ rel: "canonical", href: "/biblioteca" }],
  }),
  component: Biblioteca,
});

const features = [
  { icon: BookOpen, title: "Colección física", text: "Más de 20.000 títulos entre literatura, ciencia y consulta." },
  { icon: Globe, title: "Bases digitales", text: "Acceso a bases de datos académicas y libros electrónicos." },
  { icon: Search, title: "Catálogo en línea", text: "Consulta y reserva de material desde cualquier lugar." },
  { icon: Users, title: "Club de lectura", text: "Encuentros semanales para estudiantes y familias." },
];

function Biblioteca() {
  return (
    <PageShell>
      <PageHero eyebrow="Biblioteca" title="Un mundo de conocimiento." subtitle="Espacios y recursos para promover la lectura, la investigación y el pensamiento crítico." />
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <img src={lib} alt="Biblioteca Cafam" className="rounded-3xl shadow-[var(--shadow-lift)]" loading="lazy" />
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-display text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

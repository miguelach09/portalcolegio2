import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { FileText, Download } from "lucide-react";

const circs = [
  { date: "10 Jul 2026", title: "Circular 042 — Salida pedagógica grado 10°", tag: "Académico" },
  { date: "01 Jul 2026", title: "Circular 041 — Reunión general de padres julio", tag: "Padres" },
  { date: "22 Jun 2026", title: "Circular 040 — Convocatoria docente tecnología", tag: "RRHH" },
  { date: "15 Jun 2026", title: "Circular 039 — Cronograma segundo semestre", tag: "Académico" },
  { date: "05 Jun 2026", title: "Circular 038 — Actualización manual convivencia", tag: "Institucional" },
  { date: "20 May 2026", title: "Circular 037 — Jornada deportiva intercursos", tag: "Deporte" },
];

export const Route = createFileRoute("/circulares")({
  head: () => ({
    meta: [
      { title: "Circulares — Colegio Cafam" },
      { name: "description", content: "Comunicados y circulares oficiales del Colegio Cafam para la comunidad educativa." },
      { property: "og:title", content: "Circulares — Colegio Cafam" },
      { property: "og:description", content: "Comunicados oficiales para padres y estudiantes." },
      { property: "og:url", content: "/circulares" },
    ],
    links: [{ rel: "canonical", href: "/circulares" }],
  }),
  component: Circulares,
});

function Circulares() {
  return (
    <PageShell>
      <PageHero eyebrow="Circulares" title="Comunicaciones oficiales." subtitle="Mantente al día con la información institucional." />
      <section className="container-page py-16 md:py-24">
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {circs.map((c) => (
            <a key={c.title} href="#" className="flex items-center justify-between gap-4 p-5 hover:bg-primary-soft">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{c.date}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold">{c.tag}</span>
                  </div>
                  <h3 className="mt-1 font-display font-semibold text-foreground">{c.title}</h3>
                </div>
              </div>
              <Download className="h-5 w-5 shrink-0 text-primary" />
            </a>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { getAdminMetrics } from "@/lib/admin-tools.functions";

export const Route = createFileRoute("/_authenticated/admin/metricas/")({
  head: () => ({ meta: [{ title: "Métricas · Panel Colegio Cafam" }] }),
  component: MetricsPage,
});

const CATEGORY_LABEL: Record<string, string> = {
  circulares: "Circulares",
  guias: "Guías",
  institucionales: "Institucionales",
  admisiones: "Admisiones",
  herramientas: "Herramientas",
  revisas: "Revisas",
  general: "General",
};

function MetricsPage() {
  const fetchMetrics = useServerFn(getAdminMetrics);
  const { data, isLoading } = useQuery({ queryKey: ["admin-metrics"], queryFn: () => fetchMetrics() });
  const max = Math.max(1, ...(data?.admissionsByWeek.map((w) => w.count) ?? [1]));
  const maxDoc = Math.max(1, ...(data?.documentsByCategory.map((d) => d.count) ?? [1]));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-page flex h-16 items-center gap-4">
          <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <h1 className="text-xl font-bold text-foreground">Métricas</h1>
        </div>
      </header>
      <main className="container-page max-w-5xl space-y-6 py-8">
        {isLoading || !data ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : (
          <>
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Preinscripciones por semana</h2>
              <p className="text-sm text-muted-foreground">Últimas 8 semanas · {data.admissionsTotal} en total</p>
              <div className="mt-6 flex h-44 items-end gap-2">
                {data.admissionsByWeek.map((w) => (
                  <div key={w.week} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-medium text-foreground">{w.count}</span>
                    <div className="w-full rounded-t-md bg-primary" style={{ height: `${(w.count / max) * 120 + 4}px` }} />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(w.week + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground">Documentos publicados</h2>
                <ul className="mt-4 space-y-3">
                  {data.documentsByCategory.map((d) => (
                    <li key={d.category}>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{CATEGORY_LABEL[d.category] ?? d.category}</span>
                        <span className="font-medium text-foreground">{d.count}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-accent" style={{ width: `${(d.count / maxDoc) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground">Preguntas sin respuesta del asistente</h2>
                <p className="text-sm text-muted-foreground">{data.unansweredTotal} pendientes</p>
                {data.topUnanswered.length ? (
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-foreground">
                    {data.topUnanswered.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">Ninguna por ahora.</p>
                )}
                <Link to="/admin/asistente" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                  Ver y resolver →
                </Link>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

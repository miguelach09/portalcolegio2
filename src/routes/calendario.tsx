import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { getEvents } from "@/lib/features.functions";
import { formatDateES } from "@/lib/utils";

const eventsQueryOptions = queryOptions({
  queryKey: ["events"],
  queryFn: () => getEvents({ data: { limit: 100 } }),
});

export const Route = createFileRoute("/calendario")({
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQueryOptions),
  head: () => ({
    meta: [
      { title: "Calendario Escolar — Colegio Cafam" },
      { name: "description", content: "Calendario de eventos y actividades del Colegio Cafam." },
      { property: "og:title", content: "Calendario Escolar — Colegio Cafam" },
      { property: "og:description", content: "Eventos y actividades del colegio." },
      { property: "og:url", content: "/calendario" },
    ],
    links: [{ rel: "canonical", href: "/calendario" }],
  }),
  errorComponent: () => (
    <PageShell>
      <PageHero title="Calendario" subtitle="No se pudieron cargar los eventos en este momento." />
    </PageShell>
  ),
  component: Calendario,
});

const CATEGORY_COLORS: Record<string, string> = {
  academico: "bg-blue-soft text-primary",
  deporte: "bg-green-soft text-green-brand",
  arte: "bg-purple-soft text-purple-600",
  bienestar: "bg-orange-soft text-orange-600",
  general: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  cultural: "bg-pink-soft text-pink-600",
};

const CATEGORY_LABELS: Record<string, string> = {
  academico: "Académico",
  deporte: "Deporte",
  arte: "Arte",
  bienestar: "Bienestar",
  general: "General",
  cultural: "Cultural",
};

function Calendario() {
  const { data: events = [] } = useSuspenseQuery(eventsQueryOptions);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcoming = events.filter((e) => new Date(e.start_date) >= now);
  const past = events.filter((e) => new Date(e.start_date) < now);

  return (
    <PageShell>
      <PageHero
        eyebrow="Calendario Escolar"
        title="Eventos y actividades"
        subtitle="Mantente al día con las actividades del Colegio Cafam."
      />
      <section className="container-page py-16 md:py-24">
        {upcoming.length > 0 && (
          <>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Próximos eventos</h2>
            <div className="mt-6 space-y-4">
              {upcoming.map((e) => {
                const color = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.general;
                return (
                  <div
                    key={e.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-start"
                  >
                    <div className="flex w-full shrink-0 flex-row items-center gap-4 sm:w-auto sm:flex-col sm:items-center">
                      <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <span className="text-2xl font-bold leading-none">
                          {new Date(e.start_date + "T00:00:00").getUTCDate()}
                        </span>
                        <span className="text-[10px] uppercase">
                          {["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][new Date(e.start_date + "T00:00:00").getUTCMonth()]}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{e.title}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
                          {CATEGORY_LABELS[e.category] || e.category}
                        </span>
                      </div>
                      {e.description && <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" />
                          {formatDateES(e.start_date)}
                          {e.end_date && ` — ${formatDateES(e.end_date)}`}
                        </span>
                        {e.location && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {e.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {past.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Eventos pasados</h2>
            <div className="mt-4 space-y-2">
              {past.slice(0, 10).map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 opacity-70">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{e.title}</span>
                  <span className="text-xs text-muted-foreground">{formatDateES(e.start_date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No hay eventos programados por ahora.</p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              Volver al inicio <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>
    </PageShell>
  );
}

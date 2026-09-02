import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { BookOpen, FileText, Download, ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { getDocuments } from "@/lib/content.functions";
import { GRADE_LABELS, GRADE_ORDER, type Grade } from "@/lib/content.types";
import { formatDateES } from "@/lib/utils";

const guiasSearchSchema = z.object({
  grado: fallback(z.string(), "").default(""),
});

const allGuiasQueryOptions = queryOptions({
  queryKey: ["documents", "guias"],
  queryFn: () => getDocuments({ data: { category: "guias", limit: 500 } }),
});

export const Route = createFileRoute("/guias")({
  validateSearch: zodValidator(guiasSearchSchema),
  loader: ({ context }) => context.queryClient.ensureQueryData(allGuiasQueryOptions),
  head: () => ({
    meta: [
      { title: "Guías de Aprendizaje — Colegio Cafam" },
      {
        name: "description",
        content:
          "Guías de aprendizaje del Colegio Cafam organizadas por grado, de Transición a Once.",
      },
      { property: "og:title", content: "Guías de Aprendizaje — Colegio Cafam" },
      {
        property: "og:description",
        content: "Descarga las guías académicas por grado.",
      },
      { property: "og:url", content: "/guias" },
    ],
    links: [{ rel: "canonical", href: "/guias" }],
  }),
  component: GuiasPage,
  errorComponent: ({ error }) => {
    console.error("[guias] load error:", error);
    return (
      <PageShell>
        <PageHero
          eyebrow="Guías de Aprendizaje"
          title="Guías por grado"
          subtitle="No pudimos cargar las guías en este momento."
        />
      </PageShell>
    );
  },
});

const GRADE_ACCENTS: Record<Grade, string> = {
  transicion: "from-yellow-brand/80 to-orange-brand/80",
  primero: "from-orange-brand/80 to-pink-brand/70",
  segundo: "from-pink-brand/70 to-primary/70",
  tercero: "from-primary/80 to-accent/80",
  cuarto: "from-accent/80 to-sky/80",
  quinto: "from-sky/80 to-green-brand/70",
  sexto: "from-green-brand/70 to-yellow-brand/70",
  septimo: "from-primary/80 to-primary/60",
  octavo: "from-accent/80 to-primary/80",
  noveno: "from-orange-brand/70 to-primary/70",
  decimo: "from-pink-brand/70 to-primary/80",
  once: "from-primary to-accent",
};

function GuiasPage() {
  const { grado } = Route.useSearch();
  const { data: allDocs = [] } = useSuspenseQuery(allGuiasQueryOptions);
  const [q, setQ] = useState("");

  const selectedGrade = GRADE_ORDER.find((g) => g === grado) as Grade | undefined;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of allDocs) {
      const key = d.grade || "";
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [allDocs]);

  const filteredDocs = useMemo(() => {
    let docs = allDocs.filter((d) => !!d.grade);
    if (selectedGrade) docs = docs.filter((d) => d.grade === selectedGrade);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      docs = docs.filter((d) => d.title.toLowerCase().includes(s));
    }
    return docs;
  }, [allDocs, selectedGrade, q]);

  return (
    <PageShell>
      <PageHero
        eyebrow="Guías de Aprendizaje"
        title={
          selectedGrade
            ? `Guías – ${GRADE_LABELS[selectedGrade]}`
            : "Escoge tu grado."
        }
        subtitle={
          selectedGrade
            ? "Descarga las guías de aprendizaje disponibles para tu grado."
            : "Selecciona el grado (de Transición a Once) y accede a sus guías."
        }
      />

      <section className="container-page py-12 md:py-16">
        {!selectedGrade ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {GRADE_ORDER.map((g) => {
              const count = counts.get(g) || 0;
              return (
                <Link
                  key={g}
                  to="/guias"
                  search={{ grado: g }}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${GRADE_ACCENTS[g]} p-4 text-white shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]`}
                >
                  <BookOpen className="h-6 w-6 opacity-80" />
                  <div className="mt-6 font-display text-lg font-bold leading-tight">
                    {GRADE_LABELS[g]}
                  </div>
                  <div className="mt-1 text-xs font-medium text-white/85">
                    {count} guía{count === 1 ? "" : "s"}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/guias"
                search={{ grado: "" }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Cambiar de grado
              </Link>
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar guía..."
                  className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {GRADE_ORDER.map((g) => (
                <Link
                  key={g}
                  to="/guias"
                  search={{ grado: g }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    g === selectedGrade
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {GRADE_LABELS[g]}
                </Link>
              ))}
            </div>

            <div className="mt-8">
              {filteredDocs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    No hay guías publicadas para {GRADE_LABELS[selectedGrade]} todavía.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border rounded-2xl border border-border bg-card">
                  {filteredDocs.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.file_url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-4 p-5 hover:bg-primary-soft"
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                          <FileText className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {formatDateES(doc.published_at)}
                            </span>
                            {doc.grade && (
                              <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold text-secondary-foreground">
                                {GRADE_LABELS[doc.grade as Grade]}
                              </span>
                            )}
                            {doc.period && (
                              <span className="rounded-full bg-primary-soft px-2 py-0.5 font-semibold text-primary">
                                Periodo {doc.period}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1 font-display font-semibold text-foreground">
                            {doc.title}
                          </h3>
                        </div>
                      </div>
                      <Download className="h-5 w-5 shrink-0 text-primary" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
}

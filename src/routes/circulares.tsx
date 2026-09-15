import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { FileText, Download } from "lucide-react";
import { getDocuments } from "@/lib/content.functions";
import { formatDateES } from "@/lib/utils";
import { GRADE_ORDER, GRADE_LABELS, type Grade } from "@/lib/content.types";
import { useState } from "react";

const circularesQueryOptions = queryOptions({
  queryKey: ["documents", "circulares"],
  queryFn: () => getDocuments({ data: { category: "circulares", limit: 100 } }),
});

export const Route = createFileRoute("/circulares")({
  loader: ({ context }) => context.queryClient.ensureQueryData(circularesQueryOptions),
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
  errorComponent: ({ error }) => {
    console.error("[circulares] load error:", error);
    return (
      <PageShell>
        <PageHero title="Circulares" subtitle="No se pudieron cargar las circulares en este momento." />
        <section className="container-page py-16">
          <p className="text-muted-foreground">Inténtalo de nuevo en unos minutos.</p>
        </section>
      </PageShell>
    );
  },
});

const categoryLabels: Record<string, string> = {
  circulares: "Circular",
  revisas: "Revisa",
  admisiones: "Admisiones",
  herramientas: "Herramientas",
  general: "General",
};

function Circulares() {
  const { data: documents = [] } = useSuspenseQuery(circularesQueryOptions);

  const gradesOf = (doc: (typeof documents)[number]): Grade[] =>
    doc.grades && doc.grades.length > 0 ? doc.grades : doc.grade ? [doc.grade] : [];
  const available = GRADE_ORDER.filter((g) => documents.some((d) => gradesOf(d).includes(g)));

  const [grade, setGrade] = useState<Grade | null>(() => available[0] ?? null);

  const filtered = (grade ? documents.filter((d) => gradesOf(d).includes(grade)) : []).slice().sort(
    (a, b) => (a.published_at < b.published_at ? 1 : a.published_at > b.published_at ? -1 : 0)
  );

  // Agrupación por año, de más reciente a más antiguo.
  const groups: { year: string; docs: typeof filtered }[] = [];
  for (const doc of filtered) {
    const year = String(doc.published_at).slice(0, 4);
    const last = groups[groups.length - 1];
    if (last && last.year === year) last.docs.push(doc);
    else groups.push({ year, docs: [doc] });
  }

  return (
    <PageShell>
      <PageHero eyebrow="Circulares" title="Comunicaciones oficiales." subtitle="Mantente al día con la información institucional." />
      <section className="container-page py-16 md:py-24">
        {available.length > 0 && (
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold text-muted-foreground">Elige el grado</p>
            <div className="flex flex-wrap gap-2">
              {available.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    grade === g
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {GRADE_LABELS[g]}
                </button>
              ))}
            </div>
            {grade && (
              <p className="mt-3 text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "circular" : "circulares"} para {GRADE_LABELS[grade]}
              </p>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {grade ? `No hay circulares publicadas para ${GRADE_LABELS[grade]}.` : "No hay circulares publicadas aún."}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <div key={group.year}>
                <h2 className="mb-4 font-display text-xl font-bold text-foreground">{group.year}</h2>
                <div className="divide-y divide-border rounded-2xl border border-border bg-card">
                  {group.docs.map((doc) => (
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
                            <span>{formatDateES(doc.published_at)}</span>
                            <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold">
                              {categoryLabels[doc.category] || doc.category}
                            </span>
                          </div>
                          <h3 className="mt-1 font-display font-semibold text-foreground">{doc.title}</h3>
                        </div>
                      </div>
                      <Download className="h-5 w-5 shrink-0 text-primary" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

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
  const [grade, setGrade] = useState<Grade | "todos">("todos");

  const gradesOf = (doc: (typeof documents)[number]): Grade[] =>
    doc.grades && doc.grades.length > 0 ? doc.grades : doc.grade ? [doc.grade] : [];
  const available = GRADE_ORDER.filter((g) => documents.some((d) => gradesOf(d).includes(g)));
  const filtered = grade === "todos" ? documents : documents.filter((d) => gradesOf(d).includes(grade));

  return (
    <PageShell>
      <PageHero eyebrow="Circulares" title="Comunicaciones oficiales." subtitle="Mantente al día con la información institucional." />
      <section className="container-page py-16 md:py-24">
        {available.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {(["todos", ...available] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(g as Grade | "todos")}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  grade === g
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {g === "todos" ? "Todos los grados" : GRADE_LABELS[g as Grade]}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No hay circulares publicadas aún.</p>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {filtered.map((doc) => (
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
                      <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold">{categoryLabels[doc.category] || doc.category}</span>
                    </div>
                    <h3 className="mt-1 font-display font-semibold text-foreground">{doc.title}</h3>
                  </div>
                </div>
                <Download className="h-5 w-5 shrink-0 text-primary" />
              </a>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

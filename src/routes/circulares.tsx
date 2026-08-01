import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { FileText, Download } from "lucide-react";
import { getDocuments } from "@/lib/content.functions";
import { formatDateES } from "@/lib/utils";

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

  return (
    <PageShell>
      <PageHero eyebrow="Circulares" title="Comunicaciones oficiales." subtitle="Mantente al día con la información institucional." />
      <section className="container-page py-16 md:py-24">
        {documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No hay circulares publicadas aún.</p>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {documents.map((doc) => (
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

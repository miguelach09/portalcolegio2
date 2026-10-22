import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getDocuments } from "@/lib/content.functions";
import { PageShell } from "@/components/site/PageShell";
import { PdfViewer } from "@/components/site/PdfViewer";
import { MANUAL_TITLE } from "@/lib/content.types";

export const Route = createFileRoute("/manual-convivencia")({
  loader: async () => {
    const institucionales = await getDocuments({ data: { category: "institucionales" } });
    const manual =
      institucionales.find((d) => d.title === MANUAL_TITLE) ??
      institucionales.find((d) => d.title.startsWith("Manual de Convivencia")) ??
      null;
    return { manual };
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  head: () => ({
    meta: [
      { title: "Manual de Convivencia 2026 — Colegio Cafam" },
      {
        name: "description",
        content:
          "Consulta el Manual de Convivencia vigente del Colegio Cafam, integrado en línea con la versión publicada en la sección Mi Colegio.",
      },
      { property: "og:title", content: "Manual de Convivencia 2026 — Colegio Cafam" },
      {
        property: "og:description",
        content: "Manual de Convivencia vigente del Colegio Cafam, disponible para consulta en línea.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/manual-convivencia" },
    ],
    links: [{ rel: "canonical", href: "/manual-convivencia" }],
  }),
  errorComponent: () => (
    <PageShell>
      <div className="container-page py-24 text-center text-muted-foreground">
        No pudimos cargar el Manual de Convivencia. Intenta de nuevo más tarde.
      </div>
    </PageShell>
  ),
  component: ManualConvivenciaPage,
});

function ManualConvivenciaPage() {
  const { manual } = Route.useLoaderData();

  return (
    <PageShell>
      <section className="container-page py-12 md:py-16">
        <div className="mb-6 flex flex-col gap-2">
          <Link
            to="/mi-colegio"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a Mi Colegio
          </Link>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Mi Colegio</span>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Manual de Convivencia</h1>
        </div>
        <PdfViewer url={manual?.file_url ?? null} title={MANUAL_TITLE} />
      </section>
    </PageShell>
  );
}

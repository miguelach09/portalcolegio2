import { createFileRoute } from "@tanstack/react-router";
import { getDocuments } from "@/lib/content.functions";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { Award, Target, Eye, Heart, FileText, ExternalLink, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/mi-colegio")({
  loader: async () => ({
    institucionales: await getDocuments({ data: { category: "institucionales" } }),
  }),
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  errorComponent: () => (
    <PageShell>
      <div className="container-page py-24 text-center text-muted-foreground">
        No pudimos cargar los documentos institucionales. Intenta de nuevo más tarde.
      </div>
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <div className="container-page py-24 text-center">Página no encontrada.</div>
    </PageShell>
  ),
  head: () => ({
    meta: [
      { title: "Mi Colegio — PEI, Manual de Convivencia y documentos | Cafam" },
      { name: "description", content: "Consulta el PEI, el Manual de Convivencia 2026, los documentos administrativos y el recorrido virtual del Colegio Cafam." },
      { property: "og:title", content: "Mi Colegio — Colegio Cafam" },
      { property: "og:description", content: "PEI, Manual de Convivencia, documentos administrativos y recorrido virtual del Colegio Cafam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/mi-colegio" },
    ],
    links: [{ rel: "canonical", href: "/mi-colegio" }],
  }),
  component: MiColegio,
});

const pillars = [
  { icon: Target, title: "Misión", text: "Formar personas íntegras, autónomas y competentes, comprometidas con la construcción de una mejor sociedad a través de una educación de calidad." },
  { icon: Eye, title: "Visión", text: "Ser reconocidos como una institución educativa líder en formación humana, académica y ciudadana en Colombia." },
  { icon: Heart, title: "Valores", text: "Respeto, responsabilidad, honestidad, solidaridad y excelencia guían nuestro proyecto educativo." },
  { icon: Award, title: "PEI", text: "Nuestro Proyecto Educativo Institucional articula lo académico, lo humano y lo trascendente." },
];

const PEI_TITLE = "PEI Colegio Cafam — Síntesis";
const MANUAL_TITLE = "Manual de Convivencia — Colegio Cafam 2026";

const videos = [
  { id: "1zG4D1f2mYw", title: "Este es mi Colegio Cafam" },
  { id: "BjIY2xvHhmc", title: "Recorrido virtual por nuestro Colegio Cafam" },
];

type TabKey = "pei" | "manual" | "documentos" | "recorrido";

const tabs: { key: TabKey; label: string }[] = [
  { key: "pei", label: "PEI (Proyecto Educativo Institucional)" },
  { key: "manual", label: "Manual de Convivencia" },
  { key: "documentos", label: "Documentos administrativos" },
  { key: "recorrido", label: "Recorrido virtual" },
];

function PdfViewer({ url, title }: { url: string | null; title: string }) {
  if (!url) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-muted-foreground shadow-[var(--shadow-card)]">
        Este documento aún no está publicado. Súbelo desde el panel de administración.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          {title}
        </h3>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Abrir en pestaña nueva <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
      <iframe src={url} title={title} loading="lazy" className="h-[70vh] min-h-[480px] w-full bg-muted" />
    </div>
  );
}

function MiColegio() {
  const { institucionales } = Route.useLoaderData();
  const [tab, setTab] = useState<TabKey>("pei");

  const urlOf = (title: string) =>
    institucionales.find((d) => d.title === title)?.file_url ?? null;
  const adminDocs = institucionales.filter(
    (d) => d.title !== PEI_TITLE && d.title !== MANUAL_TITLE
  );

  return (
    <PageShell>
      <PageHero
        eyebrow="Mi Colegio"
        title="Más de 50 años formando comunidad."
        subtitle="Desde 1971 el Colegio Cafam ha sido un referente de educación de calidad, con un proyecto que integra excelencia académica, formación humana y desarrollo integral."
      />

      <section className="container-page py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold">{title}</h2>
              <p className="mt-3 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Documentos institucionales</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Consulta y descarga</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Aquí encuentras el PEI, el Manual de Convivencia vigente, los documentos administrativos y los videos del recorrido por nuestras instalaciones.
          </p>

          <div className="mt-8 flex flex-wrap gap-3" role="tablist" aria-label="Secciones de Mi Colegio">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  tab === t.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {tab === "pei" && <PdfViewer url={urlOf(PEI_TITLE)} title={PEI_TITLE} />}
            {tab === "manual" && <PdfViewer url={urlOf(MANUAL_TITLE)} title={MANUAL_TITLE} />}

            {tab === "documentos" && (
              <ul className="grid gap-4 md:grid-cols-2">
                {adminDocs.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={doc.file_url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:border-primary hover:shadow-lg"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <FileText className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block font-semibold">{doc.title}</span>
                        <span className="mt-1 block text-sm text-muted-foreground">PDF — clic para ver</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {tab === "recorrido" && (
              <div className="grid gap-8 md:grid-cols-2">
                {videos.map((v) => (
                  <figure key={v.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                    <div className="aspect-video w-full bg-muted">
                      <iframe
                        src={`https://www.youtube.com/embed/${v.id}`}
                        title={v.title}
                        className="h-full w-full"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <figcaption className="flex items-center gap-2 px-5 py-4 font-semibold">
                      <PlayCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                      {v.title}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 rounded-3xl bg-primary-soft p-8 md:p-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Nuestra historia</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Un legado de excelencia</h2>
          <div className="mt-6 grid gap-6 text-muted-foreground md:grid-cols-2">
            <p>
              El Colegio Cafam nace en 1971 como respuesta a la necesidad de brindar educación de calidad a las familias de la Caja de Compensación Familiar. A lo largo de estas décadas hemos formado a miles de estudiantes que hoy son profesionales comprometidos con el país.
            </p>
            <p>
              Contamos con instalaciones modernas: piscina semiolímpica, canchas deportivas, laboratorios, biblioteca y aulas equipadas con tecnología, todas al servicio de un aprendizaje significativo.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

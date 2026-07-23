import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { CheckCircle2, FileText, Calendar, Users, Download } from "lucide-react";
import { getDocuments } from "@/lib/content.functions";

const docsQueryOptions = queryOptions({
  queryKey: ["admisiones-docs"],
  queryFn: () => getDocuments({ data: { category: "admisiones", limit: 20 } }),
});

export const Route = createFileRoute("/admisiones")({
  loader: ({ context }) => context.queryClient.ensureQueryData(docsQueryOptions),
  head: () => ({
    meta: [
      { title: "Admisiones 2027 — Colegio Cafam" },
      { name: "description", content: "Preinscripciones abiertas del 15 de julio al 17 de agosto de 2026. Conoce el proceso de admisión al Colegio Cafam." },
      { property: "og:title", content: "Admisiones 2027 — Colegio Cafam" },
      { property: "og:description", content: "Preinscripciones abiertas: 15 julio – 17 agosto 2026." },
      { property: "og:url", content: "/admisiones" },
    ],
    links: [{ rel: "canonical", href: "/admisiones" }],
  }),
  component: Admisiones,
});

const steps = [
  { icon: FileText, title: "1. Preinscripción", text: "Diligencia el formulario en línea con los datos del aspirante y del acudiente." },
  { icon: Calendar, title: "2. Cita de evaluación", text: "Recibirás fecha y hora para la evaluación diagnóstica del estudiante." },
  { icon: Users, title: "3. Entrevista familiar", text: "Un encuentro con las familias para conocer el proyecto educativo Cafam." },
  { icon: CheckCircle2, title: "4. Matrícula", text: "Confirmación de cupo y proceso de matrícula con la documentación requerida." },
];

const requirements = [
  "Registro civil o tarjeta de identidad del aspirante",
  "Certificados de estudios de los dos últimos años",
  "Observador del estudiante",
  "Boletines finales del año anterior",
  "Documento de identidad del acudiente",
  "Recibo de servicio público del domicilio",
];

function Admisiones() {
  const { data: docs = [] } = useSuspenseQuery(docsQueryOptions);

  return (
    <PageShell>
      <PageHero
        eyebrow="Admisiones 2027"
        title="Bienvenido al proceso de admisión."
        subtitle="Estamos felices de que consideres al Colegio Cafam para la formación de tu hijo. Preinscripciones abiertas del 15 de julio al 17 de agosto de 2026."
      />

      <section className="container-page py-16 md:py-24">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Proceso</span>
        <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Cuatro pasos sencillos</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h3 className="font-display text-2xl font-bold">Documentos requeridos</h3>
            <ul className="mt-5 space-y-3">
              {requirements.map((r) => (
                <li key={r} className="flex items-start gap-3 text-sm text-foreground/85">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-brand" />
                  {r}
                </li>
              ))}
            </ul>

            {docs.length > 0 && (
              <>
                <h4 className="mt-8 font-display text-lg font-bold">Descargas del proceso</h4>
                <ul className="mt-4 space-y-2">
                  {docs.map((doc) => (
                    <li key={doc.id}>
                      <a
                        href={doc.file_url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium hover:border-primary hover:text-primary"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          {doc.title}
                        </span>
                        <Download className="h-4 w-4 shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="rounded-2xl bg-[image:var(--gradient-hero)] p-8 text-white shadow-[var(--shadow-lift)]">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest">Fechas clave</span>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3"><Calendar className="mt-0.5 h-5 w-5" /><div><b>15 jul – 17 ago 2026</b><br/><span className="text-white/80 text-sm">Preinscripciones en línea</span></div></li>
              <li className="flex items-start gap-3"><Calendar className="mt-0.5 h-5 w-5" /><div><b>Sep – Oct 2026</b><br/><span className="text-white/80 text-sm">Evaluaciones diagnósticas</span></div></li>
              <li className="flex items-start gap-3"><Calendar className="mt-0.5 h-5 w-5" /><div><b>Nov 2026</b><br/><span className="text-white/80 text-sm">Entrevistas familiares</span></div></li>
              <li className="flex items-start gap-3"><Calendar className="mt-0.5 h-5 w-5" /><div><b>Ene 2027</b><br/><span className="text-white/80 text-sm">Matrículas e inicio de clases</span></div></li>
            </ul>
            <a href="https://portalcolegio.com/admisiones.php" target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary">
              Iniciar preinscripción
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

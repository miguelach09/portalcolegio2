import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { getFaqs } from "@/lib/features.functions";

const faqsQueryOptions = queryOptions({
  queryKey: ["faqs"],
  queryFn: () => getFaqs(),
});

export const Route = createFileRoute("/faq")({
  loader: ({ context }) => context.queryClient.ensureQueryData(faqsQueryOptions),
  head: () => ({
    meta: [
      { title: "Preguntas Frecuentes — Colegio Cafam" },
      { name: "description", content: "Respuestas a las preguntas más comunes sobre el Colegio Cafam: admisiones, matrículas, horarios y más." },
      { property: "og:title", content: "Preguntas Frecuentes — Colegio Cafam" },
      { property: "og:description", content: "Resolvemos tus dudas." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  errorComponent: () => (
    <PageShell>
      <PageHero title="Preguntas Frecuentes" subtitle="No se pudieron cargar las preguntas." />
    </PageShell>
  ),
  component: FAQ,
});

const CATEGORY_LABELS: Record<string, string> = {
  admisiones: "Admisiones",
  academico: "Académico",
  general: "General",
  bienestar: "Bienestar",
  plataformas: "Plataformas",
};

function FAQ() {
  const { data: faqs = [] } = useSuspenseQuery(faqsQueryOptions);
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <PageShell>
      <PageHero
        eyebrow="Ayuda"
        title="Preguntas Frecuentes"
        subtitle="Encuentra respuestas rápidas a las dudas más comunes."
      />
      <section className="container-page py-16 md:py-24">
        {faqs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">No hay preguntas frecuentes disponibles aún.</p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-10">
            {categories.map((cat) => (
              <div key={cat}>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {CATEGORY_LABELS[cat] || cat}
                </h2>
                <div className="mt-4 space-y-3">
                  {faqs
                    .filter((f) => f.category === cat)
                    .map((f) => {
                      const isOpen = openId === f.id;
                      return (
                        <div key={f.id} className="overflow-hidden rounded-xl border border-border bg-card">
                          <button
                            onClick={() => setOpenId(isOpen ? null : f.id)}
                            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                          >
                            <span className="font-medium text-slate-900 dark:text-white">{f.question}</span>
                            <ChevronDown
                              className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                              {f.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

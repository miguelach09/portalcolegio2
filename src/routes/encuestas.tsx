import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { BarChart3, CheckCircle2, Loader2, Vote } from "lucide-react";
import { getActiveSurveys, getSurveyResults, castVote } from "@/lib/features.functions";
import { formatDateES } from "@/lib/utils";

const surveysQueryOptions = queryOptions({
  queryKey: ["active-surveys"],
  queryFn: () => getActiveSurveys(),
});

export const Route = createFileRoute("/encuestas")({
  loader: ({ context }) => context.queryClient.ensureQueryData(surveysQueryOptions),
  head: () => ({
    meta: [
      { title: "Encuestas — Colegio Cafam" },
      { name: "description", content: "Participa en las encuestas de la comunidad Cafam." },
      { property: "og:title", content: "Encuestas — Colegio Cafam" },
      { property: "og:description", content: "Tu opinión cuenta." },
      { property: "og:url", content: "/encuestas" },
    ],
    links: [{ rel: "canonical", href: "/encuestas" }],
  }),
  errorComponent: () => (
    <PageShell>
      <PageHero title="Encuestas" subtitle="No se pudieron cargar las encuestas." />
    </PageShell>
  ),
  component: Encuestas,
});

function getFingerprint(): string {
  const KEY = "cafam_voter_fp";
  let fp = localStorage.getItem(KEY);
  if (!fp) {
    fp =
      Math.random().toString(36).slice(2) +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2);
    localStorage.setItem(KEY, fp);
  }
  return fp;
}

function SurveyCard({
  survey,
  index,
}: {
  survey: (Awaited<ReturnType<typeof getActiveSurveys>>)[number];
  index: number;
}) {
  const queryClient = useQueryClient();
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const castVoteFn = useServerFn(castVote);

  const hasVoted =
    typeof localStorage !== "undefined" &&
    localStorage.getItem(`voted_${survey.id}`) !== null;

  const resultsQuery = useQuery({
    queryKey: ["survey-results", survey.id],
    queryFn: () => getSurveyResults({ data: { survey_id: survey.id } }),
    enabled: hasVoted,
  });

  const totalVotes =
    resultsQuery.data?.reduce((sum, o) => sum + (o.vote_count || 0), 0) || 0;

  async function handleVote() {
    if (!votedOption) return;
    setSubmitting(true);
    setError(null);
    try {
      const fp = getFingerprint();
      await castVoteFn({ data: { survey_id: survey.id, option_id: votedOption, voter_hash: fp } });
      localStorage.setItem(`voted_${survey.id}`, votedOption);
      await queryClient.invalidateQueries({ queryKey: ["survey-results", survey.id] });
    } catch (err: any) {
      if (err?.message?.includes("Ya votaste")) {
        localStorage.setItem(`voted_${survey.id}`, "duplicate");
      }
      setError(err?.message || "No se pudo registrar tu voto.");
    } finally {
      setSubmitting(false);
    }
  }

  const expired = survey.expires_at && new Date(survey.expires_at) < new Date();
  const showResults = hasVoted || expired;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Encuesta {index + 1}</span>
          <h3 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">{survey.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{survey.question}</p>
        </div>
        {expired && (
          <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Cerrada
          </span>
        )}
      </div>

      {!showResults ? (
        <div className="mt-5 space-y-2">
          {survey.options.map((opt) => (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                votedOption === opt.id
                  ? "border-primary bg-primary-soft"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name={`survey-${survey.id}`}
                checked={votedOption === opt.id}
                onChange={() => setVotedOption(opt.id)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm text-foreground">{opt.label}</span>
            </label>
          ))}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={handleVote}
            disabled={!votedOption || submitting}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 transition-transform disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Vote className="h-4 w-4" />}
            Votar
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {resultsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando resultados...
            </div>
          ) : (
            resultsQuery.data?.map((opt) => {
              const pct = totalVotes > 0 ? Math.round((opt.vote_count! / totalVotes) * 100) : 0;
              return (
                <div key={opt.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{opt.label}</span>
                    <span className="font-medium text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" />
            {totalVotes} voto{totalVotes !== 1 ? "s" : ""} en total
            {survey.expires_at && ` · Cierra el ${formatDateES(survey.expires_at.slice(0, 10))}`}
          </div>
        </div>
      )}

      {hasVoted && !expired && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-brand">
          <CheckCircle2 className="h-4 w-4" /> ¡Gracias por participar!
        </div>
      )}
    </div>
  );
}

function Encuestas() {
  const { data: surveys = [] } = useSuspenseQuery(surveysQueryOptions);

  return (
    <PageShell>
      <PageHero
        eyebrow="Participa"
        title="Encuestas"
        subtitle="Tu opinión nos ayuda a mejorar. Participa en las encuestas activas."
      />
      <section className="container-page py-16 md:py-24">
        {surveys.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Vote className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No hay encuestas activas en este momento.</p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-4xl gap-6">
            {surveys.map((s, i) => (
              <SurveyCard key={s.id} survey={s} index={i} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

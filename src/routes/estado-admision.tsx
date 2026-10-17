import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CalendarClock, CheckCircle2, Loader2, Search } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import {
  lookupApplication,
  bookInterview,
  cancelInterview,
  type ApplicationLookup,
} from "@/lib/admissions.functions";
import { APPLICATION_STATUSES } from "@/lib/directory.types";

export const Route = createFileRoute("/estado-admision")({
  head: () => ({
    meta: [
      { title: "Estado de mi preinscripción · Colegio Cafam" },
      { name: "description", content: "Consulta el estado de la preinscripción y agenda la entrevista de admisión en el Colegio Cafam con tu código y correo." },
      { property: "og:title", content: "Estado de mi preinscripción · Colegio Cafam" },
      { property: "og:description", content: "Consulta tu solicitud de admisión y agenda la entrevista." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StatusPage,
});

const STATUS_HELP: Record<string, string> = {
  nuevo: "Recibimos la preinscripción. Pronto el equipo de admisiones la revisará.",
  contactado: "El equipo de admisiones ya se comunicó con la familia.",
  en_proceso: "La solicitud está en evaluación.",
  admitido: "¡Felicitaciones! El aspirante fue admitido. Admisiones te indicará los pasos de matrícula.",
  descartado: "La solicitud no continuó en el proceso. Para más información escribe a admisiones.",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusPage() {
  const lookup = useServerFn(lookupApplication);
  const book = useServerFn(bookInterview);
  const cancel = useServerFn(cancelInterview);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<ApplicationLookup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await lookup({ data: { code, email } });
      if (!r.found) {
        setResult(null);
        setError("No encontramos una preinscripción con ese código y correo. Revisa los datos.");
      } else setResult(r);
    } catch {
      setError("Revisa el código (8 letras o números) y el correo.");
    } finally {
      setLoading(false);
    }
  }

  async function choose(slotId: string) {
    setBookingId(slotId);
    try {
      const r = await book({ data: { code, email, slotId } });
      if (!r.ok) setError(r.reason);
      await search();
    } finally {
      setBookingId(null);
    }
  }

  async function handleCancel() {
    if (!confirm("¿Cancelar la entrevista agendada?")) return;
    await cancel({ data: { code, email } });
    await search();
  }

  const statusLabel = result ? APPLICATION_STATUSES.find((s) => s.value === result.status)?.label ?? result.status : "";

  // Agrupa horarios libres por día.
  const byDay = new Map<string, ApplicationLookup["availableSlots"]>();
  for (const s of result?.availableSlots ?? []) {
    const day = new Date(s.starts_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota", weekday: "long", day: "numeric", month: "long" });
    byDay.set(day, [...(byDay.get(day) ?? []), s]);
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Admisiones 2027"
        title="Estado de mi preinscripción"
        subtitle="Consulta cómo va la solicitud y agenda la entrevista con el código que recibiste al preinscribirte."
      />
      <section className="container-page max-w-3xl py-12">
        <form onSubmit={search} className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
          <label className="text-sm font-medium text-foreground">
            Código
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              placeholder="Ej. 4F9A2C1B"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono tracking-widest outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </label>
          <label className="text-sm font-medium text-foreground">
            Correo del acudiente
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Consultar
          </button>
        </form>

        {error && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        {result && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Aspirante: <span className="font-medium text-foreground">{result.studentFirstName}</span> · Grado {result.grade}
              </p>
              <p className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{statusLabel}</p>
              <p className="mt-3 text-sm text-foreground">{STATUS_HELP[result.status] ?? ""}</p>
            </div>

            {result.interview ? (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
                <h2 className="inline-flex items-center gap-2 font-semibold text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Entrevista agendada
                </h2>
                <p className="mt-2 text-sm capitalize text-foreground">{fmt(result.interview.starts_at)}</p>
                {result.interview.location && <p className="text-sm text-muted-foreground">Lugar: {result.interview.location}</p>}
                <button onClick={handleCancel} className="mt-4 text-sm font-medium text-destructive hover:underline">
                  Cancelar o cambiar horario
                </button>
              </div>
            ) : result.availableSlots.length > 0 ? (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="inline-flex items-center gap-2 font-semibold text-foreground">
                  <CalendarClock className="h-5 w-5 text-primary" /> Agenda tu entrevista
                </h2>
                <div className="mt-4 space-y-5">
                  {[...byDay.entries()].map(([day, slots]) => (
                    <div key={day}>
                      <p className="text-sm font-medium capitalize text-foreground">{day}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {slots.map((s) => (
                          <button
                            key={s.id}
                            disabled={!!bookingId}
                            onClick={() => choose(s.id)}
                            className="rounded-full border border-primary/40 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
                          >
                            {bookingId === s.id ? "Agendando…" : new Date(s.starts_at).toLocaleTimeString("es-CO", { timeZone: "America/Bogota", hour: "numeric", minute: "2-digit" })}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : ["nuevo", "contactado", "en_proceso"].includes(result.status) ? (
              <p className="text-sm text-muted-foreground">Aún no hay horarios de entrevista disponibles. Vuelve a consultar en unos días.</p>
            ) : null}
          </div>
        )}

        <p className="mt-10 text-sm text-muted-foreground">
          ¿Aún no te has preinscrito? <Link to="/admisiones" className="font-medium text-primary hover:underline">Ir a Admisiones</Link>
        </p>
      </section>
    </PageShell>
  );
}

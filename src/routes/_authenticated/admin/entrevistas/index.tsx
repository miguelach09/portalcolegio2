import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getInterviewSlots, createInterviewSlots, deleteInterviewSlot } from "@/lib/admissions.functions";

export const Route = createFileRoute("/_authenticated/admin/entrevistas/")({
  head: () => ({ meta: [{ title: "Entrevistas · Panel Colegio Cafam" }] }),
  component: InterviewsPage,
});

const input = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary";

function InterviewsPage() {
  const qc = useQueryClient();
  const fetchSlots = useServerFn(getInterviewSlots);
  const create = useServerFn(createInterviewSlots);
  const remove = useServerFn(deleteInterviewSlot);
  const { data: slots = [], isLoading } = useQuery({ queryKey: ["admin-slots"], queryFn: () => fetchSlots() });
  const [form, setForm] = useState({ date: "", startTime: "08:00", endTime: "12:00", duration: 30, location: "" });
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await create({ data: form });
      toast.success(`${r.created} horarios creados`);
      qc.invalidateQueries({ queryKey: ["admin-slots"] });
    } catch {
      toast.error("Revisa la fecha y el rango de horas");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, booked: boolean) {
    if (!confirm(booked ? "Este horario ya tiene una familia agendada. ¿Eliminarlo de todos modos?" : "¿Eliminar este horario?")) return;
    await remove({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-slots"] });
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("es-CO", { timeZone: "America/Bogota", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-page flex h-16 items-center gap-4">
          <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <h1 className="text-xl font-bold text-foreground">Entrevistas de admisión</h1>
        </div>
      </header>
      <main className="container-page max-w-5xl space-y-6 py-8">
        <form onSubmit={handleCreate} className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-5 sm:items-end">
          <label className="text-sm font-medium">Día<input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={input} /></label>
          <label className="text-sm font-medium">Desde<input type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={input} /></label>
          <label className="text-sm font-medium">Hasta<input type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={input} /></label>
          <label className="text-sm font-medium">Minutos c/u
            <select value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className={input}>
              {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <button disabled={saving} className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {saving ? "Creando…" : "Crear horarios"}
          </button>
          <label className="text-sm font-medium sm:col-span-5">Lugar (opcional)
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ej. Oficina de Admisiones, bloque A" className={input} />
          </label>
        </form>
        <p className="text-sm text-muted-foreground">
          Las familias ven los horarios libres en la página "Estado de mi preinscripción" con su código y correo, y eligen uno. Cada horario es para una sola familia.
        </p>

        {isLoading ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : slots.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No hay horarios creados.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {slots.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium capitalize text-foreground">{fmt(s.starts_at)} · {s.duration_minutes} min</p>
                  {s.applicant ? (
                    <p className="text-sm text-foreground">
                      {s.applicant.student_name} (grado {s.applicant.grade}) · {s.applicant.guardian_name} · {s.applicant.guardian_phone} · código {s.applicant.tracking_code}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Libre{s.location ? ` · ${s.location}` : ""}</p>
                  )}
                </div>
                <button onClick={() => handleDelete(s.id, !!s.applicant)} className="rounded-md p-2 text-destructive hover:bg-destructive/10" aria-label="Eliminar horario">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

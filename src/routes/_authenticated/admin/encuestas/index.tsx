import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Vote, Plus, Trash2, ArrowLeft, Pencil, X, BarChart3 } from "lucide-react";
import {
  getAllSurveysAdmin,
  saveSurvey,
  deleteSurvey,
  saveSurveyOption,
  deleteSurveyOption,
  getSurveyResults,
} from "@/lib/features.functions";

export const Route = createFileRoute("/_authenticated/admin/encuestas/")({
  component: EncuestasAdmin,
});

function emptySurvey() {
  return {
    id: undefined as string | undefined,
    title: "",
    question: "",
    is_active: true,
    expires_at: "" as string,
    sort_order: 0,
  };
}

function EncuestasAdmin() {
  const queryClient = useQueryClient();
  const fetchSurveys = useServerFn(getAllSurveysAdmin);
  const saveSrv = useServerFn(saveSurvey);
  const removeSrv = useServerFn(deleteSurvey);
  const saveOpt = useServerFn(saveSurveyOption);
  const removeOpt = useServerFn(deleteSurveyOption);

  const { data: surveys = [] } = useQuery({
    queryKey: ["admin-surveys"],
    queryFn: () => fetchSurveys(),
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptySurvey());
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newOptionLabel, setNewOptionLabel] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null };
      await saveSrv({ data: { values: payload } });
      await queryClient.invalidateQueries({ queryKey: ["admin-surveys"] });
      await queryClient.invalidateQueries({ queryKey: ["active-surveys"] });
      setEditing(false);
      setForm(emptySurvey());
    } catch { alert("No se pudo guardar."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta encuesta y todos sus votos?")) return;
    try {
      await removeSrv({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["admin-surveys"] });
      await queryClient.invalidateQueries({ queryKey: ["active-surveys"] });
    } catch { alert("No se pudo eliminar."); }
  }

  async function handleAddOption(surveyId: string) {
    if (!newOptionLabel.trim()) return;
    try {
      await saveOpt({ data: { values: { survey_id: surveyId, label: newOptionLabel.trim(), sort_order: 0 } } });
      setNewOptionLabel("");
      await queryClient.invalidateQueries({ queryKey: ["active-surveys"] });
    } catch { alert("No se pudo añadir la opción."); }
  }

  async function handleDeleteOption(id: string) {
    try {
      await removeOpt({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["active-surveys"] });
    } catch { alert("No se pudo eliminar la opción."); }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-app flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Panel
          </Link>
          {!editing && (
            <button onClick={() => { setForm(emptySurvey()); setEditing(true); }}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <Plus className="h-4 w-4" /> Nueva encuesta
            </button>
          )}
        </div>
      </header>

      <main className="container-app py-10">
        <h1 className="text-2xl font-bold text-foreground">Encuestas</h1>

        {editing ? (
          <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{form.id ? "Editar encuesta" : "Nueva encuesta"}</h2>
              <button type="button" onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="block text-sm">
              <span className="font-medium">Título *</span>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Pregunta *</span>
              <input required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Fecha de cierre (opcional)</span>
              <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <span className="font-medium">Activa</span>
            </label>
            <p className="text-xs text-muted-foreground">Las opciones se añaden después de guardar la encuesta.</p>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-3">
            {surveys.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <Vote className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No hay encuestas. Crea la primera.</p>
              </div>
            ) : (
              surveys.map((s: any) => (
                <div key={s.id} className="rounded-xl border border-border bg-card">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{s.title}</h3>
                        {!s.is_active && <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Inactiva</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{s.question}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent">
                        <BarChart3 className="h-3.5 w-3.5" /> Opciones
                      </button>
                      <button onClick={() => { setForm({ id: s.id, title: s.title, question: s.question, is_active: s.is_active, expires_at: s.expires_at ? s.expires_at.slice(0, 10) : "", sort_order: s.sort_order }); setEditing(true); }}
                        className="rounded-md border border-input p-2 hover:bg-accent">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="rounded-md border border-destructive/30 p-2 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {expandedId === s.id && (
                    <SurveyOptionsEditor surveyId={s.id} newOptionLabel={newOptionLabel} setNewOptionLabel={setNewOptionLabel}
                      onAdd={handleAddOption} onDelete={handleDeleteOption} />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function SurveyOptionsEditor({
  surveyId,
  newOptionLabel,
  setNewOptionLabel,
  onAdd,
  onDelete,
}: {
  surveyId: string;
  newOptionLabel: string;
  setNewOptionLabel: (v: string) => void;
  onAdd: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { data: results = [] } = useQuery({
    queryKey: ["survey-results", surveyId],
    queryFn: () => getSurveyResults({ data: { survey_id: surveyId } }),
  });
  const total = results.reduce((sum: number, o: any) => sum + (o.vote_count || 0), 0);

  return (
    <div className="border-t border-border p-4">
      <div className="space-y-2">
        {results.length === 0 && <p className="text-sm text-muted-foreground">Sin opciones aún.</p>}
        {results.map((opt: any) => (
          <div key={opt.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
            <span className="text-foreground">{opt.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">{opt.vote_count} votos</span>
              <button onClick={() => onDelete(opt.id)} className="text-destructive hover:bg-destructive/10 rounded p-1">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={newOptionLabel}
          onChange={(e) => setNewOptionLabel(e.target.value)}
          placeholder="Nueva opción..."
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(surveyId); } }}
        />
        <button onClick={() => onAdd(surveyId)} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Añadir
        </button>
      </div>
      {total > 0 && <p className="mt-2 text-xs text-muted-foreground">Total: {total} votos</p>}
    </div>
  );
}

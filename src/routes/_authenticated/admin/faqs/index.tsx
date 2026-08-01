import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { HelpCircle, Plus, Trash2, ArrowLeft, Pencil, X } from "lucide-react";
import { getAllFaqs, saveFaq, deleteFaq } from "@/lib/features.functions";

export const Route = createFileRoute("/_authenticated/admin/faqs/")({
  component: FaqsAdmin,
});

function emptyForm() {
  return {
    id: undefined as string | undefined,
    question: "",
    answer: "",
    category: "general",
    is_active: true,
    sort_order: 0,
  };
}

function FaqsAdmin() {
  const queryClient = useQueryClient();
  const fetchFaqs = useServerFn(getAllFaqs);
  const save = useServerFn(saveFaq);
  const remove = useServerFn(deleteFaq);
  const { data: faqs = [] } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: () => fetchFaqs(),
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  function startNew() { setForm(emptyForm()); setEditing(true); }
  function startEdit(f: any) {
    setForm({ id: f.id, question: f.question, answer: f.answer, category: f.category, is_active: f.is_active, sort_order: f.sort_order });
    setEditing(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await save({ data: { values: form } });
      await queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      await queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setEditing(false);
      setForm(emptyForm());
    } catch { alert("No se pudo guardar."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    try {
      await remove({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      await queryClient.invalidateQueries({ queryKey: ["faqs"] });
    } catch { alert("No se pudo eliminar."); }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-app flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Panel
          </Link>
          {!editing && (
            <button onClick={startNew} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <Plus className="h-4 w-4" /> Nueva pregunta
            </button>
          )}
        </div>
      </header>

      <main className="container-app py-10">
        <h1 className="text-2xl font-bold text-foreground">Preguntas frecuentes</h1>

        {editing ? (
          <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{form.id ? "Editar pregunta" : "Nueva pregunta"}</h2>
              <button type="button" onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="block text-sm">
              <span className="font-medium">Pregunta *</span>
              <input required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Respuesta *</span>
              <textarea required rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Categoría</span>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <span className="font-medium">Activa (visible al público)</span>
            </label>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-3">
            {faqs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <HelpCircle className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No hay preguntas. Crea la primera.</p>
              </div>
            ) : (
              faqs.map((f: any) => (
                <div key={f.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">{f.category}</span>
                      <h3 className="mt-1 font-semibold text-foreground">{f.question}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{f.answer}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => startEdit(f)} className="rounded-md border border-input p-2 hover:bg-accent">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(f.id)} className="rounded-md border border-destructive/30 p-2 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

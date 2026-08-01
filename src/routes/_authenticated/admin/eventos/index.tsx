import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CalendarDays, Plus, Trash2, ArrowLeft, Pencil, X } from "lucide-react";
import { getAllEvents, saveEvent, deleteEvent } from "@/lib/features.functions";
import { formatDateES } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/eventos/")({
  component: EventosAdmin,
});

const CATEGORIES = ["general", "academico", "deporte", "arte", "bienestar", "cultural"];
const STATUS_OPTS = ["published", "draft"];

function emptyForm() {
  return {
    id: undefined as string | undefined,
    title: "",
    description: "",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: "",
    location: "",
    category: "general",
    is_active: true,
    sort_order: 0,
    status: "published" as string,
  };
}

function EventosAdmin() {
  const queryClient = useQueryClient();
  const fetchEvents = useServerFn(getAllEvents);
  const save = useServerFn(saveEvent);
  const remove = useServerFn(deleteEvent);
  const { data: events = [] } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => fetchEvents(),
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  function startNew() {
    setForm(emptyForm());
    setEditing(true);
  }

  function startEdit(e: any) {
    setForm({
      id: e.id,
      title: e.title,
      description: e.description || "",
      start_date: e.start_date,
      end_date: e.end_date || "",
      location: e.location || "",
      category: e.category,
      is_active: e.is_active,
      sort_order: e.sort_order,
      status: e.status,
    });
    setEditing(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await save({ data: { values: form } });
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      setEditing(false);
      setForm(emptyForm());
    } catch {
      alert("No se pudo guardar el evento.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este evento?")) return;
    try {
      await remove({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch {
      alert("No se pudo eliminar.");
    }
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
              <Plus className="h-4 w-4" /> Nuevo evento
            </button>
          )}
        </div>
      </header>

      <main className="container-app py-10">
        <h1 className="text-2xl font-bold text-foreground">Eventos del calendario</h1>

        {editing ? (
          <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{form.id ? "Editar evento" : "Nuevo evento"}</h2>
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
              <span className="font-medium">Descripción</span>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Fecha de inicio *</span>
                <input required type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Fecha de fin</span>
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Lugar</span>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Categoría</span>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Estado</span>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm pt-6">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <span className="font-medium">Activo</span>
              </label>
            </div>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {saving ? "Guardando..." : "Guardar evento"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-3">
            {events.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No hay eventos. Crea el primero.</p>
              </div>
            ) : (
              events.map((e: any) => (
                <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{e.title}</h3>
                      {e.status === "draft" && <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Borrador</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDateES(e.start_date)}{e.location ? ` · ${e.location}` : ""}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(e)} className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent">
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button onClick={() => handleDelete(e.id)} className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 text-destructive px-3 py-1.5 text-sm hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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

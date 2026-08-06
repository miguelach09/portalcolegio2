import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, GraduationCap, Pencil, Plus, Trash2, X } from "lucide-react";
import { getAllTeachers, saveTeacher, deleteTeacher } from "@/lib/directory.functions";
import { TEACHER_AREAS, type Teacher } from "@/lib/directory.types";

export const Route = createFileRoute("/_authenticated/admin/docentes/")({
  component: DocentesAdmin,
});

const empty = {
  full_name: "",
  role_title: "Docente",
  area: "general",
  email: "",
  photo_url: "",
  bio: "",
  is_active: true,
  sort_order: 0,
};

function DocentesAdmin() {
  const queryClient = useQueryClient();
  const fetchAll = useServerFn(getAllTeachers);
  const save = useServerFn(saveTeacher);
  const remove = useServerFn(deleteTeacher);

  const { data: teachers = [] } = useQuery({
    queryKey: ["admin-teachers"],
    queryFn: () => fetchAll(),
  });

  const [editing, setEditing] = useState<null | (typeof empty & { id?: string })>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [term, setTerm] = useState("");

  const filtered = teachers.filter((t) =>
    t.full_name.toLowerCase().includes(term.trim().toLowerCase())
  );

  function openEdit(t: Teacher) {
    setEditing({
      id: t.id,
      full_name: t.full_name,
      role_title: t.role_title,
      area: t.area,
      email: t.email ?? "",
      photo_url: t.photo_url ?? "",
      bio: t.bio ?? "",
      is_active: t.is_active,
      sort_order: t.sort_order,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      await save({ data: { values: editing } });
      await queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      setEditing(null);
    } catch {
      setError("No se pudo guardar. Revisa los campos obligatorios.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este docente del directorio?")) return;
    try {
      await remove({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
    } catch {
      alert("No se pudo eliminar.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-app flex h-16 items-center justify-between">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Panel
          </Link>
          <button
            onClick={() => setEditing({ ...empty })}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Nuevo docente
          </button>
        </div>
      </header>

      <main className="container-app py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Directorio docente ({teachers.length})
            </h1>
          </div>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por nombre…"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <GraduationCap className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No hay docentes registrados.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Cargo</th>
                  <th className="px-4 py-3 font-semibold">Área</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{t.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.role_title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {TEACHER_AREAS.find((a) => a.value === t.area)?.label ?? t.area}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          t.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t.is_active ? "Publicado" : "Oculto"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          className="rounded-md border border-input p-2 hover:bg-accent"
                          aria-label={`Editar ${t.full_name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="rounded-md border border-input p-2 text-destructive hover:bg-accent"
                          aria-label={`Eliminar ${t.full_name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <form
            onSubmit={handleSave}
            className="mt-10 w-full max-w-xl rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editing.id ? "Editar docente" : "Nuevo docente"}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Cerrar"
                className="rounded-md p-2 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Nombre completo *</span>
                <input
                  value={editing.full_name}
                  onChange={(e) => setEditing({ ...editing, full_name: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Cargo *</span>
                <input
                  value={editing.role_title}
                  onChange={(e) => setEditing({ ...editing, role_title: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Área</span>
                <select
                  value={editing.area}
                  onChange={(e) => setEditing({ ...editing, area: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {TEACHER_AREAS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Correo institucional</span>
                <input
                  type="email"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Orden</span>
                <input
                  type="number"
                  min={0}
                  value={editing.sort_order}
                  onChange={(e) =>
                    setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">URL de la foto</span>
                <input
                  value={editing.photo_url}
                  onChange={(e) => setEditing({ ...editing, photo_url: e.target.value })}
                  placeholder="https://…"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Reseña breve</span>
                <textarea
                  rows={3}
                  value={editing.bio}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                />
                <span className="text-sm font-medium">Publicado en el sitio</span>
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

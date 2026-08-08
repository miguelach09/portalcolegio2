import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, KeyRound, Copy } from "lucide-react";
import {
  getStudentsAdmin,
  saveStudent,
  deleteStudent,
  createGuardianCode,
  getGuardianCodes,
  deleteGuardianCode,
} from "@/lib/family.functions";
import { GRADE_LABELS, GRADE_ORDER, type Grade } from "@/lib/content.types";
import { formatDateES } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/estudiantes/")({
  component: StudentsAdmin,
});

const emptyForm = { full_name: "", grade: "transicion", group_name: "", is_active: true };

function StudentsAdmin() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(getStudentsAdmin);
  const saveFn = useServerFn(saveStudent);
  const deleteFn = useServerFn(deleteStudent);
  const codesFn = useServerFn(getGuardianCodes);
  const createCodeFn = useServerFn(createGuardianCode);
  const deleteCodeFn = useServerFn(deleteGuardianCode);

  const { data: students = [] } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: () => listFn(),
  });
  const { data: codes = [] } = useQuery({
    queryKey: ["admin", "guardian-codes"],
    queryFn: () => codesFn(),
  });

  const [form, setForm] = useState<{
    id?: string;
    full_name: string;
    grade: string;
    group_name: string;
    is_active: boolean;
  }>({ ...emptyForm });
  const [error, setError] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "guardian-codes"] });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await saveFn({ data: { values: form } });
      setForm({ ...emptyForm });
      invalidate();
    } catch {
      setError("No pudimos guardar el estudiante. Revisa los datos.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-page flex h-16 items-center justify-between">
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Estudiantes y vinculación de familias
          </h1>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-input px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" /> Panel
          </Link>
        </div>
      </header>

      <main className="container-page grid gap-10 py-10 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <h2 className="font-display font-semibold text-slate-900 dark:text-white">
            {form.id ? "Editar estudiante" : "Nuevo estudiante"}
          </h2>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Nombre completo</span>
            <input
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Grado</span>
            <select
              value={form.grade}
              onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            >
              {GRADE_ORDER.map((g) => (
                <option key={g} value={g}>
                  {GRADE_LABELS[g]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Grupo (opcional)</span>
            <input
              value={form.group_name}
              onChange={(e) => setForm((f) => ({ ...f, group_name: e.target.value }))}
              placeholder="A"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Activo
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Guardar
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm({ ...emptyForm })}
                className="rounded-full border border-input px-4 py-2 text-sm font-medium"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="space-y-10">
          <section>
            <h2 className="font-display font-semibold text-slate-900 dark:text-white">
              Listado ({students.length})
            </h2>
            <ul className="mt-4 space-y-2">
              {students.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {GRADE_LABELS[s.grade as Grade] ?? s.grade}
                      {s.group_name ? ` · Grupo ${s.group_name}` : ""}
                      {s.is_active ? "" : " · inactivo"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await createCodeFn({ data: { student_id: s.id } });
                        invalidate();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent"
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Generar código
                    </button>
                    <button
                      onClick={() =>
                        setForm({
                          id: s.id,
                          full_name: s.full_name,
                          grade: s.grade,
                          group_name: s.group_name ?? "",
                          is_active: s.is_active,
                        })
                      }
                      className="rounded-full border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent"
                    >
                      Editar
                    </button>
                    <button
                      onClick={async () => {
                        await deleteFn({ data: { id: s.id } });
                        invalidate();
                      }}
                      className="rounded-full border border-input p-1.5 text-destructive hover:bg-destructive/10"
                      aria-label={`Eliminar ${s.full_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
              {students.length === 0 && (
                <li className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Aún no hay estudiantes registrados.
                </li>
              )}
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-slate-900 dark:text-white">
              Códigos de vinculación
            </h2>
            <ul className="mt-4 space-y-2">
              {codes.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="font-mono text-base font-semibold tracking-widest text-slate-900 dark:text-white">
                      {c.code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.student?.full_name ?? "Estudiante"} ·{" "}
                      {c.used_at ? `usado el ${formatDateES(c.used_at)}` : "sin usar"} · vence{" "}
                      {formatDateES(c.expires_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigator.clipboard?.writeText(c.code)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copiar
                    </button>
                    <button
                      onClick={async () => {
                        await deleteCodeFn({ data: { id: c.id } });
                        invalidate();
                      }}
                      className="rounded-full border border-input p-1.5 text-destructive hover:bg-destructive/10"
                      aria-label={`Eliminar código ${c.code}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
              {codes.length === 0 && (
                <li className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Genera un código desde el listado de estudiantes.
                </li>
              )}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

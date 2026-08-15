import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Bell, Trash2, Eye } from "lucide-react";
import {
  getNotificationsAdmin,
  saveNotification,
  deleteNotification,
} from "@/lib/notifications.functions";
import { getStudentsAdmin } from "@/lib/family.functions";
import { GRADE_LABELS, GRADE_ORDER, type Grade } from "@/lib/content.types";
import { formatDateES } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/notificaciones/")({
  component: NotificationsAdmin,
});

type FormState = {
  id?: string;
  title: string;
  body: string;
  link: string;
  audience: "all" | "grade" | "student";
  grade: string;
  student_id: string;
};

const emptyForm: FormState = {
  title: "",
  body: "",
  link: "",
  audience: "all",
  grade: "transicion",
  student_id: "",
};

function audienceLabel(n: {
  audience: string;
  grade: string | null;
  student_name: string | null;
}) {
  if (n.audience === "all") return "Todas las familias";
  if (n.audience === "grade")
    return `Grado ${GRADE_LABELS[(n.grade || "") as Grade] ?? n.grade}`;
  return n.student_name ? `Estudiante: ${n.student_name}` : "Estudiante";
}

function NotificationsAdmin() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(getNotificationsAdmin);
  const saveFn = useServerFn(saveNotification);
  const deleteFn = useServerFn(deleteNotification);
  const studentsFn = useServerFn(getStudentsAdmin);

  const { data: items = [] } = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: () => listFn(),
  });
  const { data: students = [] } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: () => studentsFn(),
  });

  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await saveFn({ data: { values: form } });
      setForm({ ...emptyForm });
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    } catch {
      setError("No pudimos guardar el aviso. Revisa los datos.");
    }
  }

  async function handleDelete(id: string) {
    await deleteFn({ data: { id } });
    queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-page flex h-16 items-center justify-between">
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Avisos para familias
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
            {form.id ? "Editar aviso" : "Nuevo aviso"}
          </h2>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Título</span>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Mensaje</span>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              required
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Enlace (opcional)</span>
            <input
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              placeholder="https://…"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Destinatarios</span>
            <select
              value={form.audience}
              onChange={(e) =>
                setForm((f) => ({ ...f, audience: e.target.value as FormState["audience"] }))
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            >
              <option value="all">Todas las familias</option>
              <option value="grade">Un grado</option>
              <option value="student">Un estudiante</option>
            </select>
          </label>

          {form.audience === "grade" && (
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
          )}

          {form.audience === "student" && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Estudiante</span>
              <select
                value={form.student_id}
                onChange={(e) => setForm((f) => ({ ...f, student_id: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
              >
                <option value="">Selecciona…</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} — {GRADE_LABELS[s.grade as Grade] ?? s.grade}
                  </option>
                ))}
              </select>
            </label>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Bell className="h-4 w-4" /> {form.id ? "Guardar" : "Publicar aviso"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm({ ...emptyForm })}
                className="rounded-full border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <section>
          <h2 className="font-display font-semibold text-slate-900 dark:text-white">
            Avisos publicados
          </h2>
          {items.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Aún no hay avisos publicados.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {items.map((n) => (
                <li
                  key={n.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{n.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {audienceLabel(n)} · {formatDateES(n.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <Eye className="h-4 w-4" /> {n.reads} leído(s)
                      </span>
                      <button
                        onClick={() =>
                          setForm({
                            id: n.id,
                            title: n.title,
                            body: n.body,
                            link: n.link ?? "",
                            audience: n.audience,
                            grade: n.grade ?? "transicion",
                            student_id: n.student_id ?? "",
                          })
                        }
                        className="rounded-full border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        aria-label="Eliminar aviso"
                        className="rounded-full border border-input p-2 text-destructive hover:bg-accent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

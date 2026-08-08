import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Users, FileText, Download, CheckCircle2, Plus, ArrowLeft } from "lucide-react";
import { getMyStudents, getFamilyDocuments, markCircularRead } from "@/lib/family.functions";
import { GRADE_LABELS, type Grade } from "@/lib/content.types";
import { formatDateES } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/familia/")({
  component: FamilyPortal,
});

function gradeLabel(grade: string | null) {
  if (!grade) return "General";
  return GRADE_LABELS[grade as Grade] ?? grade;
}

function FamilyPortal() {
  const studentsFn = useServerFn(getMyStudents);
  const docsFn = useServerFn(getFamilyDocuments);
  const markFn = useServerFn(markCircularRead);

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ["family", "students"],
    queryFn: () => studentsFn(),
  });
  const { data: docs = [], refetch } = useQuery({
    queryKey: ["family", "documents"],
    queryFn: () => docsFn(),
  });

  const [filter, setFilter] = useState<string>("todas");
  const categories = Array.from(new Set(docs.map((d) => d.category)));
  const filtered = docs.filter((d) => filter === "todas" || d.category === filter);

  async function open(doc: { id: string; file_url: string | null }) {
    if (doc.file_url) window.open(doc.file_url, "_blank", "noopener");
    await markFn({ data: { document_id: doc.id } });
    refetch();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-page flex h-16 items-center justify-between">
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Portal de familias
          </h1>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-input px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" /> Ir al sitio
          </Link>
        </div>
      </header>

      <main className="container-page space-y-10 py-10">
        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Mis estudiantes
            </h2>
            <Link
              to="/familia/vincular"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Vincular estudiante
            </Link>
          </div>

          {loadingStudents ? (
            <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
          ) : students.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">
                Aún no tienes estudiantes vinculados. Usa el código que te entregó el colegio.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {students.map((s) => (
                <article
                  key={s.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
                >
                  <h3 className="font-display font-bold text-slate-900 dark:text-white">
                    {s.full_name}
                  </h3>
                  <p className="mt-1 text-sm text-primary">
                    {gradeLabel(s.grade)}
                    {s.group_name ? ` · Grupo ${s.group_name}` : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Circulares y documentos para tu familia
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip active={filter === "todas"} onClick={() => setFilter("todas")}>
              Todas
            </Chip>
            {categories.map((c) => (
              <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>
                {c}
              </Chip>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No hay documentos publicados para los grados de tus estudiantes.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {filtered.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {gradeLabel(d.grade)} · {formatDateES(d.published_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {d.is_read && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <CheckCircle2 className="h-4 w-4" /> Leído
                      </span>
                    )}
                    <button
                      onClick={() => open(d)}
                      disabled={!d.file_url}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" /> Abrir
                    </button>
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

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground/75 hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

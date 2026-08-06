import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, ClipboardList, Download, Trash2 } from "lucide-react";
import {
  getAdmissionApplications,
  updateApplicationStatus,
  deleteApplication,
} from "@/lib/directory.functions";
import { APPLICATION_STATUSES } from "@/lib/directory.types";
import { formatDateES } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/preinscripciones/")({
  component: PreinscripcionesAdmin,
});

function PreinscripcionesAdmin() {
  const queryClient = useQueryClient();
  const fetchAll = useServerFn(getAdmissionApplications);
  const setStatus = useServerFn(updateApplicationStatus);
  const remove = useServerFn(deleteApplication);

  const { data: apps = [] } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => fetchAll(),
  });

  const [filter, setFilter] = useState("todos");
  const filtered = apps.filter((a) => filter === "todos" || a.status === filter);

  async function handleStatus(id: string, status: string) {
    try {
      await setStatus({ data: { id, status } });
      await queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    } catch {
      alert("No se pudo actualizar el estado.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta preinscripción?")) return;
    try {
      await remove({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    } catch {
      alert("No se pudo eliminar.");
    }
  }

  function exportCSV() {
    const header = "aspirante,grado,acudiente,correo,telefono,estado,fecha\n";
    const rows = filtered
      .map((a) =>
        [
          a.student_name,
          a.grade,
          a.guardian_name,
          a.guardian_email,
          a.guardian_phone,
          a.status,
          a.created_at.slice(0, 10),
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "preinscripciones.csv";
    a.click();
    URL.revokeObjectURL(url);
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
          {filtered.length > 0 && (
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              <Download className="h-4 w-4" /> Exportar CSV
            </button>
          )}
        </div>
      </header>

      <main className="container-app py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Preinscripciones ({apps.length})
            </h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="todos">Todos los estados</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No hay preinscripciones registradas.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {filtered.map((a) => (
              <article key={a.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-foreground">{a.student_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Grado: {a.grade}
                      {a.birth_date ? ` · Nac. ${formatDateES(a.birth_date)}` : ""}
                      {" · "}
                      {formatDateES(a.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={a.status}
                      onChange={(e) => handleStatus(a.id, e.target.value)}
                      className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                      aria-label={`Estado de ${a.student_name}`}
                    >
                      {APPLICATION_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="rounded-md border border-input p-2 text-destructive hover:bg-accent"
                      aria-label={`Eliminar preinscripción de ${a.student_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Acudiente</dt>
                    <dd className="font-medium text-foreground">{a.guardian_name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Contacto</dt>
                    <dd className="font-medium text-foreground">
                      <a href={`mailto:${a.guardian_email}`} className="text-primary hover:underline">
                        {a.guardian_email}
                      </a>{" "}
                      · {a.guardian_phone}
                    </dd>
                  </div>
                  {a.previous_school && (
                    <div>
                      <dt className="text-muted-foreground">Colegio anterior</dt>
                      <dd className="font-medium text-foreground">{a.previous_school}</dd>
                    </div>
                  )}
                  {a.comments && (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Comentarios</dt>
                      <dd className="text-foreground/85">{a.comments}</dd>
                    </div>
                  )}
                </dl>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

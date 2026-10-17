import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  listTrash,
  restoreTrashItem,
  deleteTrashItemForever,
  type TrashItem,
} from "@/lib/admin-tools.functions";

export const Route = createFileRoute("/_authenticated/admin/papelera/")({
  head: () => ({ meta: [{ title: "Papelera · Panel Colegio Cafam" }] }),
  component: TrashPage,
});

const KIND_LABEL: Record<TrashItem["kind"], string> = {
  documents: "Documento",
  news: "Noticia",
  gallery_images: "Foto de galería",
};

function TrashPage() {
  const qc = useQueryClient();
  const fetchTrash = useServerFn(listTrash);
  const restore = useServerFn(restoreTrashItem);
  const destroy = useServerFn(deleteTrashItemForever);
  const [busy, setBusy] = useState<string | null>(null);
  const { data: items = [], isLoading } = useQuery({ queryKey: ["admin-trash"], queryFn: () => fetchTrash() });

  async function act(item: TrashItem, mode: "restore" | "delete") {
    if (mode === "delete" && !confirm(`¿Eliminar definitivamente "${item.title}"? No se podrá recuperar.`)) return;
    setBusy(item.id);
    try {
      if (mode === "restore") await restore({ data: { kind: item.kind, id: item.id } });
      else await destroy({ data: { kind: item.kind, id: item.id } });
      toast.success(mode === "restore" ? "Restaurado" : "Eliminado definitivamente");
      qc.invalidateQueries();
    } catch {
      toast.error("No se pudo completar la acción");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-page flex h-16 items-center gap-4">
          <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <h1 className="text-xl font-bold text-foreground">Papelera</h1>
        </div>
      </header>
      <main className="container-page max-w-4xl py-8">
        <p className="text-sm text-muted-foreground">
          Los documentos, noticias y fotos eliminados quedan aquí 30 días. Después se borran solos.
        </p>
        {isLoading ? (
          <p className="mt-6 text-muted-foreground">Cargando…</p>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            <Trash2 className="mx-auto h-8 w-8" />
            <p className="mt-3">La papelera está vacía.</p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
            {items.map((item) => (
              <li key={`${item.kind}-${item.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {KIND_LABEL[item.kind]} · eliminado el {new Date(item.deleted_at).toLocaleDateString("es-CO")} · se borra en {item.days_left} días
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy === item.id}
                    onClick={() => act(item, "restore")}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
                  >
                    <RotateCcw className="h-4 w-4" /> Restaurar
                  </button>
                  <button
                    type="button"
                    disabled={busy === item.id}
                    onClick={() => act(item, "delete")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Trash2, ExternalLink } from "lucide-react";
import { getDocuments, deleteDocument } from "@/lib/content.functions";
import type { Document } from "@/lib/content.types";

export const Route = createFileRoute("/_authenticated/admin/documentos/")({
  component: DocumentsAdminPage,
});

const categoryLabels: Record<string, string> = {
  circulares: "Circulares",
  revisas: "Revisas",
  admisiones: "Admisiones",
  herramientas: "Herramientas",
  general: "General",
};

function DocumentsAdminPage() {
  const queryClient = useQueryClient();
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: () => getDocuments({ data: { limit: 200 } }),
  });

  async function handleDelete(doc: Document) {
    if (!confirm(`¿Eliminar "${doc.title}"?`)) return;
    await deleteDocument({ data: { id: doc.id, filePath: doc.file_path } });
    queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-app flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
              ← Volver
            </Link>
            <h1 className="text-xl font-bold text-foreground">Documentos</h1>
          </div>
          <Link
            to="/admin/documentos/nuevo"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nuevo documento
          </Link>
        </div>
      </header>

      <main className="container-app py-10">
        {isLoading ? (
          <p className="text-muted-foreground">Cargando documentos...</p>
        ) : documents.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No hay documentos aún.</p>
            <Link
              to="/admin/documentos/nuevo"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Subir el primero
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Título</th>
                  <th className="px-4 py-3 text-left font-medium">Categoría</th>
                  <th className="px-4 py-3 text-left font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-4 py-3 font-medium">{doc.title}</td>
                    <td className="px-4 py-3">{categoryLabels[doc.category] || doc.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{doc.published_at}</td>
                    <td className="px-4 py-3">
                      {doc.is_active ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Activo
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                            title="Ver archivo"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(doc)}
                          className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Eliminar"
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
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ImageIcon, Trash2 } from "lucide-react";
import { getGalleryImages, deleteGalleryImage } from "@/lib/content.functions";
import type { GalleryImage } from "@/lib/content.types";

export const Route = createFileRoute("/_authenticated/admin/galeria/")({
  component: GalleryAdminPage,
});

const categoryLabels: Record<string, string> = {
  aulas: "Aulas",
  deporte: "Deporte",
  arte: "Arte",
  ciencia: "Ciencia",
  biblioteca: "Biblioteca",
  instalaciones: "Instalaciones",
  eventos: "Eventos",
  graduacion: "Graduación",
};

function GalleryAdminPage() {
  const queryClient = useQueryClient();
  const { data: images = [], isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: () => getGalleryImages({ data: { limit: 200 } }),
  });

  async function handleDelete(img: GalleryImage) {
    if (!confirm(`¿Eliminar "${img.title}"?`)) return;
    if (!img.image_path) return;
    await deleteGalleryImage({ data: { id: img.id, imagePath: img.image_path } });
    queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-app flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
              ← Volver
            </Link>
            <h1 className="text-xl font-bold text-foreground">Galería</h1>
          </div>
          <Link
            to="/admin/galeria/nueva"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nueva imagen
          </Link>
        </div>
      </header>

      <main className="container-app py-10">
        {isLoading ? (
          <p className="text-muted-foreground">Cargando galería...</p>
        ) : images.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No hay imágenes aún.</p>
            <Link
              to="/admin/galeria/nueva"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Subir la primera
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className="rounded-xl border bg-card p-3 shadow-sm">
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
                  {img.image_url ? (
                    <img
                      src={img.image_url}
                      alt={img.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    {categoryLabels[img.category] || img.category}
                  </span>
                  <h3 className="mt-1 font-semibold text-foreground line-clamp-1">{img.title}</h3>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <Link
                    to="/admin/galeria/$id"
                    params={{ id: img.id }}
                    className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(img)}
                    className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

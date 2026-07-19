import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Newspaper, Trash2, Pencil } from "lucide-react";
import { getNews, deleteNews } from "@/lib/content.functions";
import type { NewsItem } from "@/lib/content.types";

export const Route = createFileRoute("/_authenticated/admin/noticias/")({
  component: NewsAdminPage,
});

const categoryLabels: Record<string, string> = {
  institucional: "Institucional",
  academico: "Académico",
  deporte: "Deporte",
  arte: "Arte",
  bienestar: "Bienestar",
};

function NewsAdminPage() {
  const queryClient = useQueryClient();
  const { data: news = [], isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: () => getNews({ data: { limit: 200 } }),
  });

  async function handleDelete(item: NewsItem) {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return;
    await deleteNews({ data: { id: item.id, imagePath: item.image_path || undefined } });
    queryClient.invalidateQueries({ queryKey: ["admin-news"] });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-app flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
              ← Volver
            </Link>
            <h1 className="text-xl font-bold text-foreground">Noticias</h1>
          </div>
          <Link
            to="/admin/noticias/nueva"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nueva noticia
          </Link>
        </div>
      </header>

      <main className="container-app py-10">
        {isLoading ? (
          <p className="text-muted-foreground">Cargando noticias...</p>
        ) : news.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <Newspaper className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No hay noticias aún.</p>
            <Link
              to="/admin/noticias/nueva"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Publicar la primera
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <div key={item.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Newspaper className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    {categoryLabels[item.category] || item.category}
                  </span>
                  <h3 className="mt-1 font-semibold text-foreground line-clamp-2">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.published_at}</p>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Link
                    to="/admin/noticias/$id"
                    params={{ id: item.id }}
                    className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(item)}
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

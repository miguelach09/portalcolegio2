import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { ArrowLeft, BookOpen, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  getAllLibraryBooks,
  saveLibraryBook,
  deleteLibraryBook,
} from "@/lib/library.functions";
import { libraryBookFormSchema } from "@/lib/library.schemas";
import {
  BOOK_KIND_LABELS,
  AVAILABILITY_LABELS,
  formatCOP,
  type BookAvailability,
  type BookKind,
} from "@/lib/library.types";

export const Route = createFileRoute("/_authenticated/admin/libros/")({
  component: AdminLibros,
});

const emptyForm = {
  id: undefined as string | undefined,
  kind: "consulta" as BookKind,
  title: "",
  author: "",
  publisher: "",
  grade: "",
  description: "",
  price_cop: null as number | null,
  availability: "disponible" as BookAvailability,
  is_active: true,
  sort_order: 0,
};

function AdminLibros() {
  const queryClient = useQueryClient();
  const fetchBooks = useServerFn(getAllLibraryBooks);
  const saveFn = useServerFn(saveLibraryBook);
  const deleteFn = useServerFn(deleteLibraryBook);
  const coverRef = useRef<HTMLInputElement>(null);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["admin-library-books"],
    queryFn: () => fetchBooks(),
  });

  const [form, setForm] = useState({ ...emptyForm });
  const [cover, setCover] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parse = libraryBookFormSchema.safeParse({
      ...form,
      grade: form.grade || null,
      description: form.description || null,
      price_cop:
        form.kind === "plan_lector"
          ? form.price_cop === null
            ? null
            : Number(form.price_cop)
          : null,
    });
    if (!parse.success) {
      const fieldErrors: Record<string, string> = {};
      parse.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      let coverPath: string | null = null;
      if (cover) {
        const ext = cover.name.split(".").pop() || "jpg";
        coverPath = `books/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("site-assets")
          .upload(coverPath, cover, { contentType: cover.type || "image/jpeg" });
        if (uploadError) throw uploadError;
      }
      await saveFn({ data: { values: parse.data, coverPath } });
      setForm({ ...emptyForm });
      setCover(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-library-books"] });
    } catch (err: any) {
      setErrors({ submit: err?.message || "No se pudo guardar el libro." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este libro del catálogo?")) return;
    await deleteFn({ data: { id } });
    await queryClient.invalidateQueries({ queryKey: ["admin-library-books"] });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-page flex h-16 items-center gap-4">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <h1 className="text-xl font-bold text-foreground">Libros del CRE</h1>
        </div>
      </header>

      <main className="container-page grid gap-8 py-10 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"
        >
          <h2 className="font-semibold text-foreground">
            {form.id ? "Editar libro" : "Nuevo libro"}
          </h2>

          <div>
            <label className="mb-1 block text-sm font-medium">Tipo de libro</label>
            <select
              value={form.kind}
              onChange={(e) =>
                setForm({ ...form, kind: e.target.value as BookKind })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="consulta">Consulta en Sala</option>
              <option value="plan_lector">Plan Lector (con precio)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Título</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            />
            {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Autor</label>
            <input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            />
            {errors.author && <p className="mt-1 text-sm text-destructive">{errors.author}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Editorial</label>
            <input
              value={form.publisher}
              onChange={(e) => setForm({ ...form, publisher: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            />
            {errors.publisher && (
              <p className="mt-1 text-sm text-destructive">{errors.publisher}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Grado (opcional)</label>
            <input
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              placeholder="Ej. Séptimo"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>

          {form.kind === "plan_lector" && (
            <div>
              <label className="mb-1 block text-sm font-medium">Precio (COP)</label>
              <input
                type="number"
                min={0}
                value={form.price_cop ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price_cop: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
              {errors.price_cop && (
                <p className="mt-1 text-sm text-destructive">{errors.price_cop}</p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Descripción</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Disponibilidad</label>
            <select
              value={form.availability}
              onChange={(e) =>
                setForm({ ...form, availability: e.target.value as BookAvailability })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="disponible">Disponible</option>
              <option value="agotado">Agotado</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Portada</label>
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input px-3 py-4 text-sm hover:border-primary"
            >
              <Upload className="h-4 w-4" />
              {cover ? cover.name : "Seleccionar imagen"}
            </button>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setCover(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Orden</label>
              <input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <input
                id="book_active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="book_active" className="text-sm font-medium">
                Publicado
              </label>
            </div>
          </div>

          {errors.submit && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.submit}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Guardando..." : form.id ? "Actualizar" : "Agregar libro"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => {
                  setForm({ ...emptyForm });
                  setCover(null);
                }}
                className="rounded-md border border-input px-4 py-2 text-sm font-medium"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div>
          {isLoading ? (
            <p className="text-muted-foreground">Cargando catálogo...</p>
          ) : books.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card p-10 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">Aún no hay libros registrados.</p>
            </div>
          ) : (
            <div className="divide-y rounded-xl border bg-card">
              {books.map((book) => (
                <div key={book.id} className="flex items-center gap-4 p-4">
                  <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-muted">
                    {book.cover_url && (
                      <img
                        src={book.cover_url}
                        alt={`Portada de ${book.title}`}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{book.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {book.author} · {book.publisher}
                      {book.grade ? ` · ${book.grade}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {BOOK_KIND_LABELS[book.kind]} ·{" "}
                      {AVAILABILITY_LABELS[book.availability]}
                      {book.price_cop !== null
                        ? ` · ${formatCOP(Number(book.price_cop))}`
                        : ""}
                      {book.is_active ? "" : " · Oculto"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setForm({
                        id: book.id,
                        kind: book.kind,
                        title: book.title,
                        author: book.author,
                        publisher: book.publisher,
                        grade: book.grade ?? "",
                        description: book.description ?? "",
                        price_cop: book.price_cop === null ? null : Number(book.price_cop),
                        availability: book.availability,
                        is_active: book.is_active,
                        sort_order: book.sort_order,
                      })
                    }
                    className="rounded-md border border-input px-3 py-1.5 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="rounded-md border border-input p-2 text-destructive"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

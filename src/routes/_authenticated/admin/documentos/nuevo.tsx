import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Upload, FileText, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createDocument } from "@/lib/content.functions";
import { documentFormSchema } from "@/lib/content.schemas";
import type { DocumentCategory } from "@/lib/content.types";

export const Route = createFileRoute("/_authenticated/admin/documentos/nuevo")({
  component: NewDocumentPage,
});

const categories: { value: DocumentCategory; label: string }[] = [
  { value: "circulares", label: "Circulares" },
  { value: "revisas", label: "Revisas" },
  { value: "admisiones", label: "Admisiones" },
  { value: "herramientas", label: "Herramientas" },
  { value: "general", label: "General" },
];

function NewDocumentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [values, setValues] = useState({
    title: "",
    category: "circulares" as DocumentCategory,
    published_at: new Date().toISOString().split("T")[0],
    is_active: true,
    sort_order: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!values.title) {
        setValues((v) => ({ ...v, title: selected.name.replace(/\.pdf$/i, "") }));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!file) {
      setErrors({ file: "Selecciona un archivo PDF" });
      return;
    }

    const parse = documentFormSchema.safeParse(values);
    if (!parse.success) {
      const fieldErrors: Record<string, string> = {};
      parse.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "pdf";
      const path = `documents/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(path, file, { contentType: file.type || "application/pdf" });

      if (uploadError) throw uploadError;

      await createDocument({ data: { values: parse.data, filePath: path } });
      router.navigate({ to: "/admin/documentos" });
    } catch (err: any) {
      setErrors({ submit: err.message || "Error al guardar" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-app flex h-16 items-center gap-4">
          <Link to="/admin/documentos" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver
          </Link>
          <h1 className="text-xl font-bold text-foreground">Nuevo documento</h1>
        </div>
      </header>

      <main className="container-app py-10">
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 rounded-xl border bg-card p-8 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-medium">Archivo PDF</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-background p-8 transition hover:border-primary hover:bg-accent"
            >
              {file ? (
                <>
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="font-medium text-foreground">{file.name}</span>
                  <span className="text-xs text-muted-foreground">Haz clic para cambiar</span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="font-medium text-foreground">Haz clic para seleccionar un PDF</span>
                  <span className="text-xs text-muted-foreground">Máx. 20 MB</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {errors.file && <p className="mt-2 text-sm text-destructive">{errors.file}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Título</label>
            <input
              type="text"
              value={values.title}
              onChange={(e) => setValues({ ...values, title: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Categoría</label>
              <select
                value={values.category}
                onChange={(e) => setValues({ ...values, category: e.target.value as DocumentCategory })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Fecha de publicación</label>
              <input
                type="date"
                value={values.published_at}
                onChange={(e) => setValues({ ...values, published_at: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.published_at && <p className="mt-1 text-sm text-destructive">{errors.published_at}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Orden</label>
              <input
                type="number"
                min={0}
                value={values.sort_order}
                onChange={(e) => setValues({ ...values, sort_order: Number(e.target.value) })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <input
                id="is_active"
                type="checkbox"
                checked={values.is_active}
                onChange={(e) => setValues({ ...values, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-input text-primary"
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Publicado (visible en el sitio)
              </label>
            </div>
          </div>

          {errors.submit && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errors.submit}</div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/admin/documentos"
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={uploading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {uploading ? "Guardando..." : "Guardar documento"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

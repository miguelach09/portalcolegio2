import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Bot, Trash2, Pencil, Paperclip, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  getAllKnowledge,
  saveKnowledge,
  deleteKnowledge,
  type KnowledgeEntry,
} from "@/lib/knowledge.functions";
import { KNOWLEDGE_ACCEPT, KNOWLEDGE_EXTENSIONS, validateFileExtension } from "@/lib/upload-rules";

export const Route = createFileRoute("/_authenticated/admin/asistente/")({
  component: AdminAsistente,
});

function emptyForm() {
  return {
    id: undefined as string | undefined,
    title: "",
    content: "",
    tags: "",
    is_active: true,
    sort_order: 0,
  };
}

function AdminAsistente() {
  const queryClient = useQueryClient();
  const fetchAll = useServerFn(getAllKnowledge);
  const save = useServerFn(saveKnowledge);
  const remove = useServerFn(deleteKnowledge);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["admin-knowledge"],
    queryFn: () => fetchAll(),
  });

  const [form, setForm] = useState(emptyForm());
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(k: KnowledgeEntry) {
    setForm({
      id: k.id,
      title: k.title,
      content: k.content,
      tags: k.tags ?? "",
      is_active: k.is_active,
      sort_order: k.sort_order,
    });
    setFile(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      let filePath: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "pdf";
        filePath = `knowledge/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("site-assets")
          .upload(filePath, file, { contentType: file.type || "application/pdf" });
        if (upErr) throw upErr;
      }
      await save({
        data: {
          values: {
            ...(form.id ? { id: form.id } : {}),
            title: form.title,
            content: form.content,
            tags: form.tags,
            is_active: form.is_active,
            sort_order: Number(form.sort_order) || 0,
          },
          filePath,
        },
      });
      setForm(emptyForm());
      setFile(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-knowledge"] });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la información."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta información del asistente?")) return;
    try {
      await remove({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["admin-knowledge"] });
    } catch {
      setError("No se pudo eliminar.");
    }
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
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <Bot className="h-4 w-4 text-primary" /> Entrenar asistente
          </span>
        </div>
      </header>

      <main className="container-app py-10">
        <h1 className="text-2xl font-bold text-foreground">
          Entrenamiento del asistente
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Agrega información oficial (protocolos, horarios, costos, respuestas
          frecuentes, comunicados) y el asistente la usará para responder de
          inmediato. Si adjuntas un documento, el asistente ofrecerá un botón
          para descargarlo; escribe también en el texto lo más importante del
          documento para que pueda responder con su contenido.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 max-w-3xl space-y-4 rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {form.id ? "Editar información" : "Nueva información"}
            </h2>
            {form.id && (
              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm());
                  setFile(null);
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Cancelar edición"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <label className="block text-sm">
            <span className="font-medium">Título *</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej. Protocolo de llegadas tarde 2027"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium">
              Información que el asistente debe aprender
            </span>
            <textarea
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Escribe o pega aquí el texto completo: fechas, requisitos, costos, pasos, contactos…"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium">Palabras clave (opcional)</span>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="admisiones, uniformes, transporte"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">Documento adjunto (opcional)</span>
              <input
                type="file"
                accept={KNOWLEDGE_ACCEPT}
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (!selected) return setFile(null);
                  const invalid = validateFileExtension(selected, KNOWLEDGE_EXTENSIONS);
                  if (invalid) {
                    setFile(null);
                    e.target.value = "";
                    setError(invalid);
                    return;
                  }
                  setError(null);
                  setFile(selected);
                }}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              {file && (
                <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3" /> {file.name}
                </span>
              )}
            </label>
            <label className="block text-sm">
              <span className="font-medium">Orden</span>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm({ ...form, sort_order: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <span className="font-medium">
              Activa (el asistente la usa al responder)
            </span>
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Guardando..." : form.id ? "Guardar cambios" : "Enseñar al asistente"}
          </button>
        </form>

        <section className="mt-10 max-w-3xl space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Información cargada {entries.length ? `(${entries.length})` : ""}
          </h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <Bot className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aún no has enseñado nada al asistente. Agrega la primera entrada.
              </p>
            </div>
          ) : (
            entries.map((k) => (
              <div key={k.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{k.title}</h3>
                      {!k.is_active && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Inactiva
                        </span>
                      )}
                      {k.file_path && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                          <Paperclip className="h-3 w-3" /> Documento
                        </span>
                      )}
                    </div>
                    {k.tags && (
                      <p className="mt-1 text-xs text-muted-foreground">{k.tags}</p>
                    )}
                    <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
                      {k.content}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => startEdit(k)}
                      className="rounded-md border border-input p-2 hover:bg-accent"
                      aria-label="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(k.id)}
                      className="rounded-md border border-destructive/30 p-2 text-destructive hover:bg-destructive/10"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

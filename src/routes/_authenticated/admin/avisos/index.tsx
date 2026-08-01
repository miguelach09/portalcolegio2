import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Megaphone, ArrowLeft, Check } from "lucide-react";
import { getSiteSettings, saveSiteSetting } from "@/lib/features.functions";

export const Route = createFileRoute("/_authenticated/admin/avisos/")({
  component: AvisosAdmin,
});

const ANNOUNCEMENT_KEYS = ["announcement_text", "announcement_link", "announcement_expires"];

function AvisosAdmin() {
  const queryClient = useQueryClient();
  const fetchSettings = useServerFn(getSiteSettings);
  const saveSetting = useServerFn(saveSiteSetting);
  const { data: settings = {} } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => fetchSettings(),
  });

  const [form, setForm] = useState({
    text: settings.announcement_text || "",
    link: settings.announcement_link || "",
    expires: settings.announcement_expires ? settings.announcement_expires.slice(0, 10) : "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all([
        saveSetting({ data: { values: { key: "announcement_text", value: form.text } } }),
        saveSetting({ data: { values: { key: "announcement_link", value: form.link } } }),
        saveSetting({ data: { values: { key: "announcement_expires", value: form.expires ? new Date(form.expires).toISOString() : "" } } }),
      ]);
      await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      setSaved(true);
    } catch { alert("No se pudo guardar el aviso."); }
    finally { setSaving(false); }
  }

  async function handleClear() {
    setSaving(true);
    try {
      await Promise.all(
        ANNOUNCEMENT_KEYS.map((k) => saveSetting({ data: { values: { key: k, value: "" } } }))
      );
      await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      setForm({ text: "", link: "", expires: "" });
      setSaved(true);
    } catch { alert("No se pudo limpiar el aviso."); }
    finally { setSaving(false); }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-app flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Panel
          </Link>
        </div>
      </header>

      <main className="container-app py-10 max-w-2xl">
        <div className="flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Aviso urgente del sitio</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Configura un banner de aviso que aparece en la parte superior de todas las páginas.
          Deja el texto vacío para desactivarlo.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-border bg-card p-6">
          <label className="block text-sm">
            <span className="font-medium">Texto del aviso</span>
            <input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="Ej: Cerro educativo suspendido el viernes por mantenimiento..."
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Enlace (opcional)</span>
            <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Expira el (opcional)</span>
            <input type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </label>

          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-brand">
              <Check className="h-4 w-4" /> Guardado correctamente.
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {saving ? "Guardando..." : "Guardar aviso"}
            </button>
            <button type="button" onClick={handleClear} disabled={saving}
              className="rounded-md border border-input px-5 py-2.5 text-sm font-medium hover:bg-accent disabled:opacity-60">
              Quitar aviso
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

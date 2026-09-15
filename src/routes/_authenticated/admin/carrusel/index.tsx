import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Images, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  getAllHeroSlides,
  saveHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
} from "@/lib/hero.functions";
import { heroSlideFormSchema } from "@/lib/hero.schemas";
import { ACCENT_OPTIONS, type HeroSlide } from "@/lib/hero.types";

export const Route = createFileRoute("/_authenticated/admin/carrusel/")({
  component: AdminCarrusel,
});

const emptyForm = {
  id: undefined as string | undefined,
  eyebrow: "",
  title: "",
  subtitle: "",
  cta_label: "",
  cta_href: "/admisiones",
  accent: "bg-primary",
  is_active: true,
  sort_order: 0,
};

function AdminCarrusel() {
  const queryClient = useQueryClient();
  const fetchSlides = useServerFn(getAllHeroSlides);
  const saveFn = useServerFn(saveHeroSlide);
  const deleteFn = useServerFn(deleteHeroSlide);
  const reorderFn = useServerFn(reorderHeroSlides);
  const imageRef = useRef<HTMLInputElement>(null);

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["admin-hero-slides"],
    queryFn: () => fetchSlides(),
  });

  const [form, setForm] = useState({ ...emptyForm });
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
    await queryClient.invalidateQueries({ queryKey: ["home"] });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parse = heroSlideFormSchema.safeParse(form);
    if (!parse.success) {
      const fieldErrors: Record<string, string> = {};
      parse.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    if (!form.id && !image) {
      setErrors({ submit: "Selecciona una imagen de fondo para la diapositiva." });
      return;
    }

    setSaving(true);
    try {
      let imagePath: string | null = null;
      if (image) {
        const ext = image.name.split(".").pop() || "jpg";
        imagePath = `hero/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("site-assets")
          .upload(imagePath, image, { contentType: image.type || "image/jpeg" });
        if (uploadError) throw uploadError;
      }
      await saveFn({ data: { values: parse.data, imagePath } });
      setForm({ ...emptyForm });
      setImage(null);
      await refresh();
    } catch (err: any) {
      setErrors({ submit: err?.message || "No se pudo guardar la diapositiva." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta diapositiva del carrusel?")) return;
    await deleteFn({ data: { id } });
    await refresh();
  }

  async function move(index: number, direction: -1 | 1) {
    const next = [...slides];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const a = next[index]!;
    const b = next[target]!;
    next[index] = b;
    next[target] = a;
    await reorderFn({
      data: { order: next.map((s, i) => ({ id: s.id, sort_order: i })) },
    });
    await refresh();
  }

  function edit(slide: HeroSlide) {
    setForm({
      id: slide.id,
      eyebrow: slide.eyebrow,
      title: slide.title,
      subtitle: slide.subtitle,
      cta_label: slide.cta_label,
      cta_href: slide.cta_href,
      accent: slide.accent,
      is_active: slide.is_active,
      sort_order: slide.sort_order,
    });
    setImage(null);
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
          <h1 className="text-xl font-bold text-foreground">Carrusel de inicio</h1>
        </div>
      </header>

      <main className="container-page grid gap-8 py-10 lg:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold text-foreground">
            {form.id ? "Editar diapositiva" : "Nueva diapositiva"}
          </h2>

          <div>
            <label className="mb-1 block text-sm font-medium">Etiqueta superior</label>
            <input
              value={form.eyebrow}
              onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
              placeholder="Ej. Admisiones 2027"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            />
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
            <label className="mb-1 block text-sm font-medium">Texto de apoyo</label>
            <textarea
              rows={3}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Texto del botón</label>
              <input
                value={form.cta_label}
                onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
                placeholder="Conoce el proceso"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Enlace del botón</label>
              <input
                value={form.cta_href}
                onChange={(e) => setForm({ ...form, cta_href: e.target.value })}
                placeholder="/admisiones"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
              {errors.cta_href && (
                <p className="mt-1 text-sm text-destructive">{errors.cta_href}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Color de la etiqueta</label>
            <select
              value={form.accent}
              onChange={(e) => setForm({ ...form, accent: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              {ACCENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Imagen de fondo</label>
            <button
              type="button"
              onClick={() => imageRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input px-3 py-4 text-sm hover:border-primary"
            >
              <Upload className="h-4 w-4" />
              {image ? image.name : form.id ? "Cambiar imagen (opcional)" : "Seleccionar imagen"}
            </button>
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
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
                id="slide_active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="slide_active" className="text-sm font-medium">
                Publicada
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
              {saving ? "Guardando..." : form.id ? "Actualizar" : "Agregar diapositiva"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => {
                  setForm({ ...emptyForm });
                  setImage(null);
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
            <p className="text-muted-foreground">Cargando diapositivas...</p>
          ) : slides.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card p-10 text-center">
              <Images className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">
                Aún no hay diapositivas. Mientras no agregues ninguna, el inicio mostrará el
                carrusel por defecto.
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-xl border bg-card">
              {slides.map((slide, index) => (
                <div key={slide.id} className="flex items-center gap-4 p-4">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded bg-muted">
                    {slide.image_url && (
                      <img
                        src={slide.image_url}
                        alt={slide.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{slide.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {slide.eyebrow || "Sin etiqueta"} · {slide.cta_label || "Sin botón"} →{" "}
                      {slide.cta_href}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Orden {slide.sort_order}
                      {slide.is_active ? "" : " · Oculta"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="rounded-md border border-input p-1.5 disabled:opacity-40"
                      aria-label="Subir"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === slides.length - 1}
                      className="rounded-md border border-input p-1.5 disabled:opacity-40"
                      aria-label="Bajar"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => edit(slide)}
                    className="rounded-md border border-input px-3 py-1.5 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
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

import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { ImageIcon } from "lucide-react";
import { getGalleryImages } from "@/lib/content.functions";
import { Lightbox } from "@/components/site/Lightbox";

const galleryQueryOptions = queryOptions({
  queryKey: ["gallery"],
  queryFn: () => getGalleryImages({ data: { limit: 500 } }),
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
});

export const Route = createFileRoute("/galeria")({
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQueryOptions),
  head: () => ({
    meta: [
      { title: "Galería — Colegio Cafam" },
      { name: "description", content: "Momentos de vida escolar en el Colegio Cafam: aulas, deporte, arte, ciencia y celebraciones." },
      { property: "og:title", content: "Galería — Colegio Cafam" },
      { property: "og:description", content: "Vida escolar en imágenes: aulas, deporte, arte, ciencia, izadas de bandera y celebraciones de la comunidad del Colegio Cafam." },
      { property: "og:url", content: "https://connecteducafam.lovable.app/galeria" },
    ],
    links: [{ rel: "canonical", href: "https://connecteducafam.lovable.app/galeria" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: "Galería — Colegio Cafam",
          description:
            "Momentos de vida escolar en el Colegio Cafam: aulas, deporte, arte, ciencia y celebraciones.",
          url: "https://connecteducafam.lovable.app/galeria",
          isPartOf: { "@type": "School", name: "Colegio Cafam", url: "https://connecteducafam.lovable.app/" },
        }),
      },
    ],
  }),
  component: Galeria,
  errorComponent: ({ error }) => {
    console.error("[galeria] load error:", error);
    return (
      <PageShell>
        <PageHero title="Galería" subtitle="No se pudieron cargar las imágenes en este momento." />
        <section className="container-page py-16">
          <p className="text-muted-foreground">Inténtalo de nuevo en unos minutos.</p>
        </section>
      </PageShell>
    );
  },
});

function Galeria() {
  const { data: allImages = [] } = useSuspenseQuery(galleryQueryOptions);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const years = Array.from(
    new Set(allImages.map((i) => i.year).filter((y): y is number => typeof y === "number"))
  ).sort((a, b) => b - a);
  const [year, setYear] = useState<number | "todos">(() => years[0] ?? "todos");
  const [visible, setVisible] = useState(36);

  const images =
    year === "todos" ? allImages : allImages.filter((i) => i.year === year);
  const shown = images.slice(0, visible);

  return (
    <PageShell>
      <PageHero eyebrow="Galería" title="Vida en Cafam." subtitle="Un vistazo a nuestros espacios, momentos y celebraciones." />
      <section className="container-page py-16 md:py-24">
        {years.length > 0 && (
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold text-muted-foreground">¿Qué año quieres ver?</p>
            <div className="flex flex-wrap gap-2">
              {([...years, "todos"] as const).map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setYear(y as number | "todos");
                    setVisible(36);
                    setLightboxIndex(null);
                  }}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    year === y
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {y === "todos" ? "Todos los años" : y}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {images.length} {images.length === 1 ? "foto" : "fotos"}
              {year !== "todos" ? ` de ${year}` : ""}
            </p>
          </div>
        )}

        {images.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No hay imágenes en la galería aún.</p>
          </div>
        ) : (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {shown.map((it, i) => (
              <button
                key={it.id}
                onClick={() => setLightboxIndex(i)}
                className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl text-left"
              >
                <img
                  src={it.image_url}
                  alt={it.title}
                  loading={i < 8 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full transition-transform duration-500 hover:scale-105"
                />
                <span className="block py-2 text-center text-xs text-muted-foreground">{it.title}</span>
              </button>
            ))}
          </div>
        )}

        {shown.length < images.length && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + 36)}
              className="rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              Ver más fotos ({images.length - shown.length} restantes)
            </button>
          </div>
        )}
      </section>

      <Lightbox
        images={shown.map((img) => ({ id: img.id, image_url: img.image_url, title: img.title }))}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </PageShell>
  );
}

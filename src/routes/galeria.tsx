import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { ImageIcon } from "lucide-react";
import { getGalleryImages } from "@/lib/content.functions";

const galleryQueryOptions = queryOptions({
  queryKey: ["gallery"],
  queryFn: () => getGalleryImages({ data: { limit: 200 } }),
});

export const Route = createFileRoute("/galeria")({
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQueryOptions),
  head: () => ({
    meta: [
      { title: "Galería — Colegio Cafam" },
      { name: "description", content: "Momentos de vida escolar en el Colegio Cafam: aulas, deporte, arte, ciencia y celebraciones." },
      { property: "og:title", content: "Galería — Colegio Cafam" },
      { property: "og:description", content: "Vida escolar en imágenes." },
      { property: "og:url", content: "/galeria" },
    ],
    links: [{ rel: "canonical", href: "/galeria" }],
  }),
  component: Galeria,
  errorComponent: ({ error }) => (
    <PageShell>
      <PageHero title="Galería" subtitle="No se pudieron cargar las imágenes." />
      <section className="container-page py-16">
        <p className="text-destructive">{error.message}</p>
      </section>
    </PageShell>
  ),
});

function Galeria() {
  const { data: images = [] } = useSuspenseQuery(galleryQueryOptions);

  return (
    <PageShell>
      <PageHero eyebrow="Galería" title="Vida en Cafam." subtitle="Un vistazo a nuestros espacios, momentos y celebraciones." />
      <section className="container-page py-16 md:py-24">
        {images.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No hay imágenes en la galería aún.</p>
          </div>
        ) : (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {images.map((it) => (
              <figure key={it.id} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl">
                <img
                  src={it.image_url}
                  alt={it.title}
                  loading="lazy"
                  className="w-full transition-transform duration-500 hover:scale-105"
                />
                <figcaption className="mt-2 text-center text-xs text-muted-foreground">{it.title}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

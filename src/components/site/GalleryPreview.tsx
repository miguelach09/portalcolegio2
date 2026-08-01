import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import type { GalleryImage } from "@/lib/content.types";
import { Lightbox } from "./Lightbox";

interface GalleryPreviewProps {
  images: GalleryImage[];
}

export function GalleryPreview({ images }: GalleryPreviewProps) {
  const displayImages = images.slice(0, 6);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Map categories to tall flags for visual variety
  const layoutFlags = [true, false, false, false, false, true];

  return (
    <section className="container-page py-16 md:py-24">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-green-brand">Galería</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">Vida en Cafam</h2>
          <p className="mt-2 max-w-lg text-muted-foreground">
            Instantes de aprendizaje, arte, deporte y celebración que hacen única a nuestra comunidad.
          </p>
        </div>
        <Link
          to="/galeria"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
        >
          Ver galería completa <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {displayImages.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">No hay imágenes en la galería aún.</p>
        </div>
      ) : (
        <div className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-3 md:grid-cols-3 md:auto-rows-[220px]">
          {displayImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setLightboxIndex(i)}
              className={`group relative overflow-hidden rounded-2xl ${
                layoutFlags[i] ? "row-span-2" : ""
              }`}
            >
              <img
                src={img.image_url}
                alt={img.title}
                loading="lazy"
                width={800}
                height={800}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                {img.title}
              </span>
            </button>
          ))}
        </div>
      )}

      <Lightbox
        images={displayImages.map((img) => ({ id: img.id, image_url: img.image_url, title: img.title }))}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}

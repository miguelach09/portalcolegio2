import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import lib from "@/assets/gallery-library.jpg";
import lab from "@/assets/gallery-lab.jpg";
import music from "@/assets/gallery-music.jpg";
import art from "@/assets/gallery-art.jpg";
import grad from "@/assets/gallery-graduation.jpg";
import sports from "@/assets/gallery-sports.jpg";

const images = [
  { src: lib, alt: "Biblioteca", tall: true },
  { src: lab, alt: "Laboratorio" },
  { src: music, alt: "Música" },
  { src: sports, alt: "Deporte" },
  { src: art, alt: "Arte" },
  { src: grad, alt: "Graduación", tall: true },
];

export function GalleryPreview() {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-green-brand">Galería</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Vida en Cafam</h2>
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

      <div className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-3 md:grid-cols-3 md:auto-rows-[220px]">
        {images.map((img, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-2xl ${
              img.tall ? "row-span-2" : ""
            }`}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              width={800}
              height={800}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
              {img.alt}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

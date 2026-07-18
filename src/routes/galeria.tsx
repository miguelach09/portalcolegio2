import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import lib from "@/assets/gallery-library.jpg";
import lab from "@/assets/gallery-lab.jpg";
import music from "@/assets/gallery-music.jpg";
import art from "@/assets/gallery-art.jpg";
import grad from "@/assets/gallery-graduation.jpg";
import sports from "@/assets/gallery-sports.jpg";
import pool from "@/assets/hero-pool.jpg";
import field from "@/assets/hero-sports.jpg";
import students from "@/assets/hero-students.jpg";
import cls from "@/assets/hero-classroom.jpg";

const items = [
  { src: students, label: "Comunidad" },
  { src: lab, label: "Ciencia" },
  { src: pool, label: "Instalaciones" },
  { src: music, label: "Arte" },
  { src: field, label: "Deporte" },
  { src: art, label: "Arte" },
  { src: lib, label: "Biblioteca" },
  { src: grad, label: "Graduación" },
  { src: sports, label: "Deporte" },
  { src: cls, label: "Aulas" },
];

export const Route = createFileRoute("/galeria")({
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
});

function Galeria() {
  return (
    <PageShell>
      <PageHero eyebrow="Galería" title="Vida en Cafam." subtitle="Un vistazo a nuestros espacios, momentos y celebraciones." />
      <section className="container-page py-16 md:py-24">
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {items.map((it, i) => (
            <figure key={i} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl">
              <img src={it.src} alt={it.label} loading="lazy" className="w-full transition-transform duration-500 hover:scale-105" />
            </figure>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

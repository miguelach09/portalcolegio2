import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import heroStudents from "@/assets/hero-students.jpg";
import heroPool from "@/assets/hero-pool.jpg";
import heroSports from "@/assets/hero-sports.jpg";
import heroClass from "@/assets/hero-classroom.jpg";

type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: { label: string; to: string };
  accent: string;
};

const slides: Slide[] = [
  {
    image: heroStudents,
    eyebrow: "Admisiones 2027",
    title: "Tu lugar en Cafam comienza aquí.",
    subtitle: "Preinscripciones abiertas del 15 de julio al 17 de agosto de 2026.",
    cta: { label: "Conoce el proceso", to: "/admisiones" },
    accent: "bg-orange-brand",
  },
  {
    image: heroPool,
    eyebrow: "Instalaciones",
    title: "Piscina semiolímpica techada.",
    subtitle: "Espacios pensados para formar en cuerpo, mente y espíritu.",
    cta: { label: "Ver galería", to: "/galeria" },
    accent: "bg-sky",
  },
  {
    image: heroSports,
    eyebrow: "Deporte y vida escolar",
    title: "Canchas para crecer en equipo.",
    subtitle: "Fútbol, baloncesto y más de 12 disciplinas deportivas.",
    cta: { label: "Vive Cafam", to: "/mi-colegio" },
    accent: "bg-green-brand",
  },
  {
    image: heroClass,
    eyebrow: "Comunidad Cafam",
    title: "Aprender que trasciende el aula.",
    subtitle: "Tecnología, arte y ciencia integrados al currículo.",
    cta: { label: "Descubre más", to: "/mi-colegio" },
    accent: "bg-yellow-brand",
  },
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    const timer = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => {
      emblaApi.off("select", onSelect);
      clearInterval(timer);
    };
  }, [emblaApi]);

  return (
    <section className="relative overflow-hidden">
      <div className="container-page pt-6">
        <div className="relative overflow-hidden rounded-3xl shadow-[var(--shadow-lift)]">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {slides.map((s, i) => (
                <div key={i} className="relative min-w-0 flex-[0_0_100%]">
                  <div className="relative aspect-[16/10] w-full sm:aspect-[16/8] md:aspect-[21/9]">
                    <img
                      src={s.image}
                      alt={s.title}
                      loading={i === 0 ? "eager" : "lazy"}
                      width={1600}
                      height={1000}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
                    <div className="relative flex h-full items-end p-6 sm:items-center sm:p-12 md:p-16">
                      <div className="max-w-xl text-white">
                        <span className={`inline-flex items-center rounded-full ${s.accent} px-3 py-1 text-xs font-bold uppercase tracking-widest text-black/85`}>
                          {s.eyebrow}
                        </span>
                        <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl md:text-6xl">
                          {s.title}
                        </h1>
                        <p className="mt-3 max-w-md text-base text-white/85 sm:text-lg">
                          {s.subtitle}
                        </p>
                        <Link
                          to={s.cta.to}
                          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5"
                        >
                          {s.cta.label} <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-primary shadow-md hover:bg-white sm:block"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-primary shadow-md hover:bg-white sm:block"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  selected === i ? "w-8 bg-white" : "w-2 bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

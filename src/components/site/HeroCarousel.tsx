import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import heroStudents from "@/assets/real/admisiones.jpg";
import heroPool from "@/assets/real/pool.jpg";
import heroSports from "@/assets/real/canchas.jpg";
import heroClass from "@/assets/real/admisiones.jpg";

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
    <section className="group relative h-[82vh] max-h-[820px] min-h-[540px] w-full overflow-hidden bg-primary">
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {slides.map((s, i) => (
            <div key={i} className="relative h-full min-w-0 flex-[0_0_100%]">
              {/* Imagen de fondo */}
              <div className="absolute inset-0">
                <img
                  src={s.image}
                  alt={s.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  width={1920}
                  height={1080}
                  className="h-full w-full object-cover opacity-80 transition-transform duration-[2000ms] ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/60 to-transparent" />
              </div>

              {/* Contenido */}
              <div className="container-page relative z-10 flex h-full flex-col justify-center">
                <div className="max-w-3xl space-y-6 md:space-y-8">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full ${s.accent} px-5 py-2 text-white shadow-xl transition-transform hover:scale-105 ${
                      selected === i ? "animate-fade-in" : ""
                    }`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                    </span>
                    <span className="font-display text-xs font-bold uppercase tracking-widest md:text-sm">
                      {s.eyebrow}
                    </span>
                  </div>

                  <h2 className="font-display text-4xl font-extrabold leading-[0.98] tracking-tight text-white sm:text-6xl md:text-7xl">
                    {s.title}
                  </h2>

                  <p className="max-w-xl text-lg font-medium leading-relaxed text-white/90 md:text-xl">
                    {s.subtitle}
                  </p>

                  <div className="flex items-center gap-6 pt-2">
                    <Link
                      to={s.cta.to}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-display text-base font-extrabold text-primary shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-sky hover:text-white md:px-10 md:text-lg"
                    >
                      {s.cta.label} <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paginación: barras + contador */}
      <div className="absolute bottom-16 left-5 z-20 flex items-center gap-4 md:left-12">
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                selected === i ? "w-12 bg-yellow-brand" : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
        <span className="font-display text-xs font-bold uppercase tracking-widest text-white/50">
          {String(selected + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* Flechas */}
      <div className="absolute bottom-14 right-12 z-20 hidden items-center gap-4 md:flex">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-sm transition-all hover:bg-white/10"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-sky text-white shadow-lg transition-all hover:bg-primary"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex-col items-center hidden sm:flex">
        <div className="h-12 w-px animate-pulse bg-gradient-to-b from-transparent via-white to-transparent" />
      </div>

      {/* Franja de colores de marca */}
      <div className="absolute bottom-0 left-0 z-20 flex h-2 w-full">
        <div className="flex-1 bg-primary" />
        <div className="flex-1 bg-sky" />
        <div className="flex-1 bg-yellow-brand" />
        <div className="flex-1 bg-green-brand" />
        <div className="flex-1 bg-orange-brand" />
      </div>
    </section>
  );
}

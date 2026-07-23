import { Link } from "@tanstack/react-router";
import { CalendarCheck, ArrowRight } from "lucide-react";

export function AdmissionsBanner() {
  return (
    <section className="container-page pb-16 md:pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-[image:var(--gradient-sky)] p-8 text-white shadow-[var(--shadow-lift)] md:p-14">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-yellow-brand/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest">
              <CalendarCheck className="h-3.5 w-3.5" /> Preinscripción
            </span>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-bold leading-tight md:text-5xl">
              Admisiones 2027 abiertas
            </h2>
            <p className="mt-3 max-w-lg text-white/85">
              Del <b>15 de julio</b> al <b>17 de agosto de 2026</b>. Da el primer paso para que tu hijo haga parte de la comunidad Cafam.
            </p>
          </div>
          <Link
            to="/admisiones"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Conoce el proceso <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

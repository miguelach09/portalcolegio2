import { Link } from "@tanstack/react-router";
import { Youtube, Instagram, Music2, MapPin, Phone, Mail, GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 bg-[oklch(0.2_0.05_260)] text-white/85">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="leading-none">
              <div className="font-display text-xl font-bold text-white">CAFAM</div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-white/60">Colegio</div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Formamos personas íntegras, autónomas y competentes, comprometidas con la construcción
            de una mejor sociedad.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="https://www.youtube.com/channel/UC8JLRjaP48Nwy6foi5Dwkig" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="YouTube"><Youtube className="h-5 w-5" /></a>
            <a href="https://soundcloud.com/colegiocafam" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="SoundCloud"><Music2 className="h-5 w-5" /></a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white">Enlaces</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/mi-colegio" className="hover:text-white">Mi Colegio</Link></li>
            <li><Link to="/admisiones" className="hover:text-white">Admisiones 2027</Link></li>
            <li><Link to="/galeria" className="hover:text-white">Galería</Link></li>
            <li><Link to="/circulares" className="hover:text-white">Circulares</Link></li>
            <li><Link to="/bienestar" className="hover:text-white">Bienestar</Link></li>
            <li><Link to="/biblioteca" className="hover:text-white">Biblioteca</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white">Contacto</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Av. Cra. 68 No. 90-88, Bogotá</li>
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" /> (601) 307 8060</li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" /> info@portalcolegio.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} Colegio Cafam. Todos los derechos reservados.</p>
          <p>Educación de calidad desde 1971</p>
        </div>
      </div>
    </footer>
  );
}

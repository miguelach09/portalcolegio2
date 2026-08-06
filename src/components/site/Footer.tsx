import { Link } from "@tanstack/react-router";
import { Youtube, Instagram, Music2, MapPin, Phone, Mail } from "lucide-react";
import logoCafam from "@/assets/real/logo-cafam.png";
import { NewsletterSignup } from "./NewsletterSignup";

export function Footer() {
  return (
    <footer className="mt-24 bg-[oklch(0.2_0.05_260)] text-white/85">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center rounded-xl bg-white px-3 py-2">
              <img src={logoCafam} alt="Colegio Cafam" className="h-9 w-auto" />
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Formamos personas íntegras, autónomas y competentes, comprometidas con la construcción
            de una mejor sociedad.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="https://www.youtube.com/channel/UC8JLRjaP48Nwy6foi5Dwkig" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="YouTube"><Youtube className="h-5 w-5" /></a>
            <a href="https://soundcloud.com/colegiocafam" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="SoundCloud"><Music2 className="h-5 w-5" /></a>
            <a href="https://www.instagram.com/colegiocafam/" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white">Enlaces</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/mi-colegio" className="hover:text-white">Mi Colegio</Link></li>
            <li><Link to="/admisiones" className="hover:text-white">Admisiones 2027</Link></li>
            <li><Link to="/docentes" className="hover:text-white">Directorio docente</Link></li>
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
        <div className="container-page flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-sm">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white">Boletín Cafam</h4>
            <p className="mt-1 text-sm text-white/60">Recibe noticias y circulares en tu correo.</p>
          </div>
          <div className="w-full md:max-w-md">
            <NewsletterSignup />
          </div>
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

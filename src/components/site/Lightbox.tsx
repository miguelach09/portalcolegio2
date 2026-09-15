import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: { id: string; image_url: string; title: string }[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const isOpen = index !== null && index >= 0 && index < images.length;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index! > 0) onNavigate(index! - 1);
      if (e.key === "ArrowRight" && index! < images.length - 1) onNavigate(index! + 1);
    },
    [isOpen, index, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey, isOpen]);

  if (!isOpen) return null;
  const img = images[index!];

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={img.title}
    >
      {/* Barra superior: contador y cerrar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90">
          {index! + 1} de {images.length}
        </span>
        <button
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Imagen central a tamaño casi completo */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
        {index! > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index! - 1);
            }}
            className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:left-6"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
        )}

        <figure className="flex h-full max-h-full w-full flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <img
            src={img.image_url}
            alt={img.title}
            className="max-h-full w-auto max-w-full rounded-lg object-contain shadow-2xl"
          />
        </figure>

        {index! < images.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index! + 1);
            }}
            className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:right-6"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        )}
      </div>

      {/* Título al pie */}
      <div className="px-4 py-4 text-center">
        <p className="text-base font-medium text-white/90">{img.title}</p>
        <p className="mt-1 text-xs text-white/40">Usa las flechas del teclado para navegar · Esc para cerrar</p>
      </div>
    </div>
  );
}

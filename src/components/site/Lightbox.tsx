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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      {index! > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index! - 1);
          }}
          className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {index! < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index! + 1);
          }}
          className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <figure
        className="max-h-[85vh] max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={img.image_url}
          alt={img.title}
          className="max-h-[78vh] w-auto rounded-xl object-contain"
        />
        <figcaption className="mt-3 text-center text-sm font-medium text-white/80">
          {img.title}{" "}
          <span className="text-white/40">
            ({index! + 1} de {images.length})
          </span>
        </figcaption>
      </figure>
    </div>
  );
}

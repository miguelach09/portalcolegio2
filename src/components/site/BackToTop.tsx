import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver arriba"
      className="fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 hover:text-primary"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

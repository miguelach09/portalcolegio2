import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { searchSite } from "@/lib/search.functions";

const TYPE_LABELS: Record<string, string> = {
  documento: "Documento",
  noticia: "Noticia",
  evento: "Evento",
  faq: "FAQ",
  galeria: "Galería",
};

export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const run = useServerFn(searchSite);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const { data, isFetching } = useQuery({
    queryKey: ["site-search", debounced],
    queryFn: () => run({ data: { q: debounced } }),
    enabled: open && debounced.length >= 2,
    staleTime: 30_000,
  });

  const results = useMemo(() => data ?? [], [data]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Buscar en el sitio"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-primary-soft hover:text-primary"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-foreground/40 p-4 pt-24 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-card)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Buscar circulares, guías, noticias, eventos…"
                className="h-14 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-muted-foreground dark:text-white"
              />
              {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar búsqueda"
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto">
              {debounced.length < 2 && (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  Escribe al menos 2 caracteres para buscar en todo el portal.
                </p>
              )}
              {debounced.length >= 2 && !isFetching && results.length === 0 && (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  Sin resultados para “{debounced}”.
                </p>
              )}
              <ul className="divide-y divide-border">
                {results.map((r) => (
                  <li key={`${r.type}-${r.id}`}>
                    <Link
                      to={r.to}
                      onClick={() => setOpen(false)}
                      className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-primary-soft"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                          {TYPE_LABELS[r.type] ?? r.type}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {r.title}
                        </span>
                      </div>
                      {r.snippet && (
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {r.snippet}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { ExternalLink, FileText } from "lucide-react";

export function PdfViewer({ url, title }: { url: string | null; title: string }) {
  if (!url) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-muted-foreground shadow-[var(--shadow-card)]">
        Este documento aún no está publicado. Súbelo desde el panel de administración.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          {title}
        </h3>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Abrir en pestaña nueva <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
      <iframe src={url} title={title} loading="lazy" className="h-[70vh] min-h-[480px] w-full bg-muted" />
    </div>
  );
}

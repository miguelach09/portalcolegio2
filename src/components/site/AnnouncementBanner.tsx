import { useQuery } from "@tanstack/react-query";
import { Megaphone, X } from "lucide-react";
import { useState } from "react";
import { getSiteSettings } from "@/lib/features.functions";

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
    staleTime: 5 * 60 * 1000,
  });

  const text = settings?.announcement_text;
  const link = settings?.announcement_link;
  const expiresAt = settings?.announcement_expires;

  if (!text || dismissed) return null;
  if (expiresAt && new Date(expiresAt) < new Date()) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container-page flex items-center justify-center gap-3 py-2.5 text-sm">
        <Megaphone className="h-4 w-4 shrink-0" />
        <p className="flex-1 text-center font-medium">
          {link ? (
            <a href={link} className="underline underline-offset-2 hover:no-underline">
              {text}
            </a>
          ) : (
            text
          )}
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-full p-1 hover:bg-white/20"
          aria-label="Cerrar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

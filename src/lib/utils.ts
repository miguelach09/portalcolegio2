import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Spanish month names for deterministic formatting (avoids hydration mismatch
// caused by locale/timezone differences between server and client).
const ES_MONTHS_LONG = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/**
 * Format an ISO date string (or date-only "YYYY-MM-DD") into a deterministic
 * Spanish long date like "21 de julio de 2026". Normalizes the date to
 * midnight UTC so server and client render identically regardless of timezone.
 */
export function formatDateES(iso: string): string {
  if (!iso) return "";
  // Normalize to a UTC date instance to avoid timezone drift between SSR and client
  const dateOnly = iso.includes("T") ? iso : `${iso}T00:00:00`;
  const d = new Date(dateOnly);
  const day = d.getUTCDate();
  const month = ES_MONTHS_LONG[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} de ${month} de ${year}`;
}

export type BookKind = "consulta" | "plan_lector";

export type BookAvailability = "disponible" | "agotado";

export const BOOK_KIND_LABELS: Record<BookKind, string> = {
  consulta: "Consulta en Sala",
  plan_lector: "Plan Lector",
};

export const AVAILABILITY_LABELS: Record<BookAvailability, string> = {
  disponible: "Disponible",
  agotado: "Agotado",
};

export interface LibraryBook {
  id: string;
  kind: BookKind;
  title: string;
  author: string;
  publisher: string;
  grade: string | null;
  description: string | null;
  cover_path: string | null;
  cover_url: string | null;
  price_cop: number | null;
  availability: BookAvailability;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

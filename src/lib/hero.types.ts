export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_href: string;
  accent: string;
  image_path: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const ACCENT_OPTIONS = [
  { value: "bg-primary", label: "Azul institucional" },
  { value: "bg-sky", label: "Celeste" },
  { value: "bg-yellow-brand", label: "Amarillo" },
  { value: "bg-green-brand", label: "Verde" },
  { value: "bg-orange-brand", label: "Naranja" },
] as const;

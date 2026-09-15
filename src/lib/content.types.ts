export type DocumentCategory =
  | "circulares"
  | "revisas"
  | "admisiones"
  | "herramientas"
  | "guias"
  | "institucionales"
  | "general";

export type Grade =
  | "transicion"
  | "primero"
  | "segundo"
  | "tercero"
  | "cuarto"
  | "quinto"
  | "sexto"
  | "septimo"
  | "octavo"
  | "noveno"
  | "decimo"
  | "once";

export const GRADE_ORDER: Grade[] = [
  "transicion",
  "primero",
  "segundo",
  "tercero",
  "cuarto",
  "quinto",
  "sexto",
  "septimo",
  "octavo",
  "noveno",
  "decimo",
  "once",
];

export const GRADE_LABELS: Record<Grade, string> = {
  transicion: "Transición",
  primero: "Primero",
  segundo: "Segundo",
  tercero: "Tercero",
  cuarto: "Cuarto",
  quinto: "Quinto",
  sexto: "Sexto",
  septimo: "Séptimo",
  octavo: "Octavo",
  noveno: "Noveno",
  decimo: "Décimo",
  once: "Once",
};

export type NewsCategory =
  | "institucional"
  | "academico"
  | "deporte"
  | "arte"
  | "bienestar";

export type GalleryCategory =
  | "aulas"
  | "deporte"
  | "arte"
  | "ciencia"
  | "biblioteca"
  | "instalaciones"
  | "eventos"
  | "graduacion";

export type Period = 1 | 2 | 3 | 4;

export const PERIOD_ORDER: Period[] = [1, 2, 3, 4];

export const PERIOD_LABELS: Record<Period, string> = {
  1: "Periodo 1",
  2: "Periodo 2",
  3: "Periodo 3",
  4: "Periodo 4",
};

export type DocumentArea =
  | "ciencias"
  | "matematicas"
  | "ingles"
  | "castellano"
  | "humanidades"
  | "tecnologia"
  | "artes"
  | "profundizacion"
  | "ciencias_sociales";

export const AREA_ORDER: DocumentArea[] = [
  "ciencias",
  "matematicas",
  "ingles",
  "castellano",
  "humanidades",
  "tecnologia",
  "artes",
  "ciencias_sociales",
  "profundizacion",
];

export const AREA_LABELS: Record<DocumentArea, string> = {
  ciencias: "Ciencias",
  matematicas: "Matemáticas",
  ingles: "Inglés",
  castellano: "Castellano",
  humanidades: "Humanidades",
  tecnologia: "Tecnología",
  artes: "Artes",
  ciencias_sociales: "Ciencias Sociales",
  profundizacion: "Profundización",
};

/** Profundización solo existe en Décimo y Once. */
export function areasForGrade(grade: Grade | null): DocumentArea[] {
  if (grade === "decimo" || grade === "once") return AREA_ORDER;
  return AREA_ORDER.filter((a) => a !== "profundizacion");
}

export interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
  grade: Grade | null;
  grades: Grade[];
  period: Period | null;
  area: DocumentArea | null;
  file_path: string;
  file_url: string | null;
  file_size: number | null;
  file_type: string | null;
  published_at: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  image_url: string | null;
  image_path: string | null;
  category: NewsCategory;
  published_at: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  category: GalleryCategory;
  image_url: string;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuickAccessItem {
  label: string;
  desc: string;
  href: string;
  external?: boolean;
}

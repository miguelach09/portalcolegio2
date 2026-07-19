export type DocumentCategory =
  | "circulares"
  | "revisas"
  | "admisiones"
  | "herramientas"
  | "general";

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

export interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
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

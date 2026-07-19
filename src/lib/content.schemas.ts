import { z } from "zod";

export const documentCategorySchema = z.enum([
  "circulares",
  "revisas",
  "admisiones",
  "herramientas",
  "general",
]);

export const newsCategorySchema = z.enum([
  "institucional",
  "academico",
  "deporte",
  "arte",
  "bienestar",
]);

export const galleryCategorySchema = z.enum([
  "aulas",
  "deporte",
  "arte",
  "ciencia",
  "biblioteca",
  "instalaciones",
  "eventos",
  "graduacion",
]);

export const documentFormSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  category: documentCategorySchema,
  published_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export const documentUpdateSchema = documentFormSchema.extend({
  id: z.string().uuid(),
});

export const newsFormSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  summary: z.string().optional(),
  content: z.string().optional(),
  category: newsCategorySchema,
  published_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export const newsUpdateSchema = newsFormSchema.extend({
  id: z.string().uuid(),
});

export const galleryImageFormSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  category: galleryCategorySchema,
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export const galleryImageUpdateSchema = galleryImageFormSchema.extend({
  id: z.string().uuid(),
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;
export type NewsFormValues = z.infer<typeof newsFormSchema>;
export type GalleryImageFormValues = z.infer<typeof galleryImageFormSchema>;

import { z } from "zod";

export const documentCategorySchema = z.enum([
  "circulares",
  "revisas",
  "admisiones",
  "herramientas",
  "guias",
  "general",
]);

export const gradeSchema = z.enum([
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

export const periodSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const documentFormSchema = z
  .object({
    title: z.string().min(1, "El título es obligatorio"),
    category: documentCategorySchema,
    grade: gradeSchema.nullable().optional(),
    period: periodSchema.nullable().optional(),
    published_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    is_active: z.boolean().default(true),
    sort_order: z.number().int().min(0).default(0),
  })
  .refine((v) => v.category !== "guias" || !!v.grade, {
    message: "Selecciona el grado para la guía",
    path: ["grade"],
  })
  .refine((v) => v.category !== "guias" || !!v.period, {
    message: "Selecciona el periodo para la guía",
    path: ["period"],
  });

export const documentUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  category: documentCategorySchema,
  grade: gradeSchema.nullable().optional(),
  period: periodSchema.nullable().optional(),
  published_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
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

import { z } from "zod";

export const eventFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  location: z.string().optional(),
  category: z.string().min(1),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
  status: z.enum(["draft", "published"]).default("published"),
});

export const faqFormSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(1, "La pregunta es obligatoria"),
  answer: z.string().min(1, "La respuesta es obligatoria"),
  category: z.string().min(1).default("general"),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export const surveyFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "El título es obligatorio"),
  question: z.string().min(1, "La pregunta es obligatoria"),
  is_active: z.boolean().default(true),
  expires_at: z.string().nullable().optional(),
  sort_order: z.number().int().min(0).default(0),
});

export const surveyOptionFormSchema = z.object({
  id: z.string().uuid().optional(),
  survey_id: z.string().uuid(),
  label: z.string().min(1, "La opción es obligatoria"),
  sort_order: z.number().int().min(0).default(0),
});

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  email: z.string().trim().email("Correo inválido").max(255),
  subject: z.string().max(200).optional(),
  message: z.string().trim().min(1, "El mensaje es obligatorio").max(2000),
});

export const subscriberSchema = z.object({
  email: z.string().trim().email("Correo inválido").max(255),
});

export const siteSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(5000),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
export type FaqFormValues = z.infer<typeof faqFormSchema>;
export type SurveyFormValues = z.infer<typeof surveyFormSchema>;
export type SurveyOptionFormValues = z.infer<typeof surveyOptionFormSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;

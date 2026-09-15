import { z } from "zod";

export const heroSlideFormSchema = z.object({
  id: z.string().uuid().optional(),
  eyebrow: z.string().trim().max(80).default(""),
  title: z.string().trim().min(1, "El título es obligatorio").max(160),
  subtitle: z.string().trim().max(300).default(""),
  cta_label: z.string().trim().max(60).default(""),
  cta_href: z.string().trim().min(1, "El destino es obligatorio").max(300).default("/"),
  accent: z.string().trim().min(1).max(40).default("bg-primary"),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export type HeroSlideFormValues = z.infer<typeof heroSlideFormSchema>;

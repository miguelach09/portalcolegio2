import { z } from "zod";

export const studentFormSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().trim().min(3, "El nombre es obligatorio").max(120),
  grade: z.string().trim().min(1, "Selecciona el grado").max(40),
  group_name: z.string().trim().max(20).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export const redeemCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, "El código debe tener al menos 6 caracteres")
    .max(20, "Código inválido"),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;

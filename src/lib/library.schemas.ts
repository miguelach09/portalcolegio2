import { z } from "zod";

export const bookKindSchema = z.enum(["consulta", "plan_lector"]);
export const bookAvailabilitySchema = z.enum(["disponible", "agotado"]);

export const libraryBookFormSchema = z
  .object({
    id: z.string().uuid().optional(),
    kind: bookKindSchema,
    title: z.string().trim().min(1, "El título es obligatorio").max(200),
    author: z.string().trim().min(1, "El autor es obligatorio").max(150),
    publisher: z.string().trim().min(1, "La editorial es obligatoria").max(150),
    grade: z.string().trim().max(40).nullable().optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    price_cop: z.number().min(0).nullable().optional(),
    availability: bookAvailabilitySchema.default("disponible"),
    is_active: z.boolean().default(true),
    sort_order: z.number().int().min(0).default(0),
  })
  .refine(
    (v) => v.kind !== "plan_lector" || (v.price_cop !== null && v.price_cop !== undefined),
    { message: "Indica el precio del libro de Plan Lector", path: ["price_cop"] }
  );

export type LibraryBookFormValues = z.infer<typeof libraryBookFormSchema>;

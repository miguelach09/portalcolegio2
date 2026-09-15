import { z } from "zod";
import { ADMISSION_GRADES, APPLICATION_STATUSES } from "./directory.types";

export const admissionFormSchema = z.object({
  student_name: z
    .string()
    .trim()
    .min(3, "Escribe el nombre completo del aspirante")
    .max(120),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
    .or(z.literal(""))
    .optional(),
  grade: z.enum(ADMISSION_GRADES, { message: "Selecciona el grado al que aspira" }),
  guardian_name: z.string().trim().min(3, "Escribe el nombre del acudiente").max(120),
  guardian_email: z.string().trim().email("Correo inválido").max(255),
  guardian_phone: z
    .string()
    .trim()
    .min(7, "Escribe un teléfono de contacto válido")
    .max(30),
  previous_school: z.string().trim().max(200).optional(),
  comments: z.string().trim().max(2000).optional(),
});

export const applicationStatusSchema = z.enum(APPLICATION_STATUSES);

export type AdmissionFormValues = z.infer<typeof admissionFormSchema>;

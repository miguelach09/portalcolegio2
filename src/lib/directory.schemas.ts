import { z } from "zod";

export const teacherFormSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().trim().min(3, "El nombre es obligatorio").max(120),
  role_title: z.string().trim().min(2, "El cargo es obligatorio").max(120),
  area: z.string().trim().min(1).max(60),
  email: z.string().trim().email("Correo inválido").max(255).optional().or(z.literal("")),
  photo_url: z.string().trim().max(1000).optional().or(z.literal("")),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export const admissionFormSchema = z.object({
  student_name: z.string().trim().min(3, "Nombre del aspirante obligatorio").max(120),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
    .optional()
    .or(z.literal("")),
  grade: z.string().trim().min(1, "Selecciona el grado").max(40),
  guardian_name: z.string().trim().min(3, "Nombre del acudiente obligatorio").max(120),
  guardian_email: z.string().trim().email("Correo inválido").max(255),
  guardian_phone: z.string().trim().min(7, "Teléfono inválido").max(30),
  previous_school: z.string().trim().max(200).optional().or(z.literal("")),
  comments: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type TeacherFormValues = z.infer<typeof teacherFormSchema>;
export type AdmissionFormValues = z.infer<typeof admissionFormSchema>;

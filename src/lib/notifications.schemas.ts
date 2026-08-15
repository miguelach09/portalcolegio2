import { z } from "zod";

export const notificationFormSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(3, "El título es obligatorio").max(140),
    body: z.string().trim().min(3, "El mensaje es obligatorio").max(2000),
    link: z.string().trim().max(400).optional().or(z.literal("")),
    audience: z.enum(["all", "grade", "student"]),
    grade: z.string().trim().max(40).optional().or(z.literal("")),
    student_id: z.string().uuid().optional().or(z.literal("")),
  })
  .refine((v) => v.audience !== "grade" || Boolean(v.grade), {
    message: "Selecciona el grado",
    path: ["grade"],
  })
  .refine((v) => v.audience !== "student" || Boolean(v.student_id), {
    message: "Selecciona el estudiante",
    path: ["student_id"],
  });

export type NotificationFormValues = z.infer<typeof notificationFormSchema>;

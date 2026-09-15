export const ADMISSION_GRADES = [
  "Transición",
  "Primero",
  "Segundo",
  "Tercero",
  "Cuarto",
  "Quinto",
  "Sexto",
  "Séptimo",
  "Octavo",
  "Noveno",
  "Décimo",
  "Undécimo",
] as const;

export const APPLICATION_STATUSES = [
  "nuevo",
  "contactado",
  "en_proceso",
  "admitido",
  "descartado",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type AdmissionApplication = {
  id: string;
  student_name: string;
  birth_date: string | null;
  grade: string;
  guardian_name: string;
  guardian_email: string;
  guardian_phone: string;
  previous_school: string | null;
  comments: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

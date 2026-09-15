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
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "en_proceso", label: "En proceso" },
  { value: "admitido", label: "Admitido" },
  { value: "descartado", label: "Descartado" },
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]["value"];

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

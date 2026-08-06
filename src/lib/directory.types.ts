export interface Teacher {
  id: string;
  full_name: string;
  role_title: string;
  area: string;
  email: string | null;
  photo_url: string | null;
  photo_path: string | null;
  bio: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdmissionApplication {
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
}

export const TEACHER_AREAS = [
  { value: "directivo", label: "Directivos" },
  { value: "preescolar", label: "Preescolar" },
  { value: "matematicas", label: "Matemáticas" },
  { value: "lenguaje", label: "Lenguaje" },
  { value: "ciencias", label: "Ciencias" },
  { value: "sociales", label: "Ciencias Sociales" },
  { value: "ingles", label: "Inglés" },
  { value: "arte", label: "Arte y Música" },
  { value: "deporte", label: "Educación Física" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "bienestar", label: "Bienestar y Orientación" },
  { value: "general", label: "Otras áreas" },
] as const;

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
  "Once",
] as const;

export const APPLICATION_STATUSES = [
  { value: "nuevo", label: "Nuevo" },
  { value: "en_revision", label: "En revisión" },
  { value: "citado", label: "Citado a evaluación" },
  { value: "admitido", label: "Admitido" },
  { value: "no_admitido", label: "No admitido" },
] as const;

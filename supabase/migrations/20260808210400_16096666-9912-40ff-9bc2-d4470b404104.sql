-- 1) Rol familia
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'familia';

-- 2) Estudiantes
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  grade text NOT NULL,
  group_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 3) Vínculos acudiente-estudiante
CREATE TABLE public.student_guardians (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship text NOT NULL DEFAULT 'acudiente',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.student_guardians TO authenticated;
GRANT ALL ON public.student_guardians TO service_role;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;

-- 4) Códigos de vinculación
CREATE TABLE public.guardian_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '60 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardian_links TO authenticated;
GRANT ALL ON public.guardian_links TO service_role;
ALTER TABLE public.guardian_links ENABLE ROW LEVEL SECURITY;

-- 5) Confirmaciones de lectura
CREATE TABLE public.circular_reads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, user_id)
);
GRANT SELECT, INSERT ON public.circular_reads TO authenticated;
GRANT ALL ON public.circular_reads TO service_role;
ALTER TABLE public.circular_reads ENABLE ROW LEVEL SECURITY;

-- 6) Helper: ¿el usuario está vinculado a este estudiante?
CREATE OR REPLACE FUNCTION public.is_guardian_of(_user_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_guardians sg
    WHERE sg.user_id = _user_id AND sg.student_id = _student_id
  )
$$;

-- 7) Políticas: students
CREATE POLICY "Staff can manage students" ON public.students
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "Guardians can read their students" ON public.students
  FOR SELECT TO authenticated
  USING (public.is_guardian_of(auth.uid(), id));

-- 8) Políticas: student_guardians
CREATE POLICY "Staff can manage guardian links" ON public.student_guardians
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "Guardians can read own links" ON public.student_guardians
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 9) Políticas: guardian_links (solo staff; el canje va por server function con service role)
CREATE POLICY "Staff can manage link codes" ON public.guardian_links
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- 10) Políticas: circular_reads
CREATE POLICY "Staff can read all circular reads" ON public.circular_reads
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "Users can read own circular reads" ON public.circular_reads
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can confirm reading" ON public.circular_reads
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 11) updated_at trigger
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
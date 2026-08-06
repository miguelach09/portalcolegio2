CREATE TABLE public.teachers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  role_title text NOT NULL DEFAULT 'Docente',
  area text NOT NULL DEFAULT 'general',
  email text,
  photo_url text,
  photo_path text,
  bio text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.teachers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT ALL ON public.teachers TO service_role;

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active teachers"
  ON public.teachers FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Admins can manage teachers"
  ON public.teachers FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.admission_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name text NOT NULL,
  birth_date date,
  grade text NOT NULL,
  guardian_name text NOT NULL,
  guardian_email text NOT NULL,
  guardian_phone text NOT NULL,
  previous_school text,
  comments text,
  status text NOT NULL DEFAULT 'nuevo',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.admission_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admission_applications TO authenticated;
GRANT ALL ON public.admission_applications TO service_role;

ALTER TABLE public.admission_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an application"
  ON public.admission_applications FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(student_name)) BETWEEN 3 AND 120
    AND length(btrim(grade)) BETWEEN 1 AND 40
    AND length(btrim(guardian_name)) BETWEEN 3 AND 120
    AND length(guardian_email) <= 255
    AND guardian_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(btrim(guardian_phone)) BETWEEN 7 AND 30
    AND (previous_school IS NULL OR length(previous_school) <= 200)
    AND (comments IS NULL OR length(comments) <= 2000)
    AND status = 'nuevo'
  );

CREATE POLICY "Admins can read applications"
  ON public.admission_applications FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can update applications"
  ON public.admission_applications FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can delete applications"
  ON public.admission_applications FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE TRIGGER update_admission_applications_updated_at
  BEFORE UPDATE ON public.admission_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
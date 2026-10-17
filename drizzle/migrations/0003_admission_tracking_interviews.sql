ALTER TABLE public.admission_applications
  ADD COLUMN IF NOT EXISTS tracking_code text NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
CREATE UNIQUE INDEX IF NOT EXISTS admission_applications_tracking_code_key ON public.admission_applications (tracking_code);

CREATE TABLE public.interview_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  location text,
  application_id uuid UNIQUE REFERENCES public.admission_applications(id) ON DELETE SET NULL,
  booked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_slots TO authenticated;
GRANT ALL ON public.interview_slots TO service_role;
ALTER TABLE public.interview_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage interview slots" ON public.interview_slots FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE INDEX interview_slots_starts_idx ON public.interview_slots (starts_at);
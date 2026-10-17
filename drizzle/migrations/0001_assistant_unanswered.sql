CREATE TABLE public.assistant_unanswered (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  page_path text,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.assistant_unanswered TO authenticated;
GRANT ALL ON public.assistant_unanswered TO service_role;
ALTER TABLE public.assistant_unanswered ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage unanswered" ON public.assistant_unanswered FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE INDEX assistant_unanswered_created_idx ON public.assistant_unanswered (created_at DESC);
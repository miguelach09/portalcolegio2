DROP POLICY IF EXISTS "Public can read survey options" ON public.survey_options;

CREATE POLICY "Public can read options of active surveys"
ON public.survey_options
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.surveys s
    WHERE s.id = survey_options.survey_id
      AND s.is_active = true
  )
);
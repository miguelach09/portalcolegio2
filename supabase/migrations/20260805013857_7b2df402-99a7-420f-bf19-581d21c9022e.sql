-- 1. Storage: remove blanket public/authenticated read on site-assets
DROP POLICY IF EXISTS "Allow public read on site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read on site-assets" ON storage.objects;

-- 2. contact_messages: validated public insert
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact message"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 2 AND 120
  AND length(email) <= 255
  AND email ~* '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND (subject IS NULL OR length(subject) <= 200)
  AND length(btrim(message)) BETWEEN 5 AND 5000
  AND status = 'nuevo'
);

-- 3. subscribers: validated public insert
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.subscribers;
CREATE POLICY "Anyone can subscribe"
ON public.subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(email) <= 255
  AND email ~* '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND is_active = true
);

-- 4. survey_votes: only active, non-expired surveys and matching options
DROP POLICY IF EXISTS "Anyone can vote" ON public.survey_votes;
CREATE POLICY "Anyone can vote"
ON public.survey_votes
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(voter_hash)) BETWEEN 8 AND 128
  AND EXISTS (
    SELECT 1 FROM public.surveys s
    WHERE s.id = survey_votes.survey_id
      AND s.is_active = true
      AND (s.expires_at IS NULL OR s.expires_at > now())
  )
  AND EXISTS (
    SELECT 1 FROM public.survey_options o
    WHERE o.id = survey_votes.option_id
      AND o.survey_id = survey_votes.survey_id
  )
);
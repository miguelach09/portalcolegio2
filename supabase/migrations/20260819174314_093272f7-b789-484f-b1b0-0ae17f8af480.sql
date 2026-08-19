DROP POLICY IF EXISTS "Public can read settings" ON public.site_settings;

CREATE POLICY "Public can read announcement settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (key IN ('announcement_text', 'announcement_link', 'announcement_expires'));
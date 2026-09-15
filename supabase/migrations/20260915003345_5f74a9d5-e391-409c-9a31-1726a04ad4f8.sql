DROP POLICY IF EXISTS "Public can read active teachers" ON public.teachers;

CREATE OR REPLACE VIEW public.teachers_public AS
SELECT id, full_name, role_title, area, photo_url, bio, sort_order
FROM public.teachers
WHERE is_active = true;

GRANT SELECT ON public.teachers_public TO anon, authenticated;
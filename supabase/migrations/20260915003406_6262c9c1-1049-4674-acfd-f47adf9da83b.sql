DROP VIEW IF EXISTS public.teachers_public;

CREATE POLICY "Public can read active teachers"
ON public.teachers FOR SELECT TO anon
USING (is_active = true);

REVOKE SELECT ON public.teachers FROM anon;
GRANT SELECT (id, full_name, role_title, area, photo_url, photo_path, bio, is_active, sort_order, created_at, updated_at)
ON public.teachers TO anon;
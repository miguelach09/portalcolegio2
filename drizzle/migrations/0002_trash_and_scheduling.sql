ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
DROP POLICY IF EXISTS "Public can read active news" ON public.news;
CREATE POLICY "Public can read active news" ON public.news FOR SELECT TO anon
USING (is_active = true AND status = 'published' AND deleted_at IS NULL AND (scheduled_at IS NULL OR scheduled_at <= now()));
DROP POLICY IF EXISTS "Public can read active documents" ON public.documents;
CREATE POLICY "Public can read active documents" ON public.documents FOR SELECT TO anon
USING (is_active = true AND deleted_at IS NULL);
DROP POLICY IF EXISTS "Public can read active gallery images" ON public.gallery_images;
CREATE POLICY "Public can read active gallery images" ON public.gallery_images FOR SELECT TO anon
USING (is_active = true AND deleted_at IS NULL);
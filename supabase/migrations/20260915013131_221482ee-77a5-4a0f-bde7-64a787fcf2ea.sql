DROP POLICY IF EXISTS "Admins can upload to site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin insert on site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update on site-assets" ON storage.objects;

CREATE POLICY "Admins can upload allowed file types to site-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-assets'
  AND public.has_role(auth.uid(), 'admin')
  AND lower(substring(name from '\.([^./]+)$')) IN ('pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx')
);

CREATE POLICY "Admins can update allowed file types on site-assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'site-assets'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'site-assets'
  AND public.has_role(auth.uid(), 'admin')
  AND lower(substring(name from '\.([^./]+)$')) IN ('pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx')
);
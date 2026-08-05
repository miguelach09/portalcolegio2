-- Purge stored public object URLs; files are served via short-lived signed URLs.
UPDATE public.news
SET image_url = NULL
WHERE image_url LIKE '%/storage/v1/object/public/site-assets/%';

UPDATE public.gallery_images
SET image_url = ''
WHERE image_url LIKE '%/storage/v1/object/public/site-assets/%';

UPDATE public.documents
SET file_url = NULL
WHERE file_url LIKE '%/storage/v1/object/public/site-assets/%';
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS year integer;

UPDATE public.gallery_images
SET year = (regexp_match(title, '\((\d{4})\)\s*$'))[1]::int
WHERE year IS NULL AND title ~ '\((\d{4})\)\s*$';

UPDATE public.gallery_images
SET title = btrim(regexp_replace(title, '\s*\((\d{4})\)\s*$', ''))
WHERE title ~ '\((\d{4})\)\s*$';
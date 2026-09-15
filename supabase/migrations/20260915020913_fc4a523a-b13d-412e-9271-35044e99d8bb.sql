ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS grades text[] NOT NULL DEFAULT '{}'::text[];

UPDATE public.documents SET grades = ARRAY[grade] WHERE grade IS NOT NULL AND cardinality(grades) = 0;

ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'institucionales';

DROP TABLE IF EXISTS public.teachers CASCADE;
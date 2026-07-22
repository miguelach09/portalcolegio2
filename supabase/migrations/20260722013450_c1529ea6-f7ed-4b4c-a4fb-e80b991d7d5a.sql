ALTER TYPE public.document_category ADD VALUE IF NOT EXISTS 'guias';

ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS grade TEXT;

ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_grade_check;
ALTER TABLE public.documents ADD CONSTRAINT documents_grade_check
  CHECK (grade IS NULL OR grade IN (
    'transicion','primero','segundo','tercero','cuarto','quinto',
    'sexto','septimo','octavo','noveno','decimo','once'
  ));

CREATE INDEX IF NOT EXISTS documents_category_grade_active_idx
  ON public.documents (category, grade, is_active);
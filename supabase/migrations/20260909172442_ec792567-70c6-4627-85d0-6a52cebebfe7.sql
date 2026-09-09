CREATE TYPE public.document_area AS ENUM ('ciencias','matematicas','ingles','castellano','humanidades','tecnologia','artes','profundizacion','ciencias_sociales');

ALTER TABLE public.documents ADD COLUMN area public.document_area;

CREATE TABLE public.library_books (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind text NOT NULL DEFAULT 'consulta' CHECK (kind IN ('consulta','plan_lector')),
  title text NOT NULL,
  author text NOT NULL DEFAULT '',
  publisher text NOT NULL DEFAULT '',
  grade text,
  description text,
  cover_path text,
  cover_url text,
  price_cop numeric(12,2),
  availability text NOT NULL DEFAULT 'disponible' CHECK (availability IN ('disponible','agotado')),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.library_books TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_books TO authenticated;
GRANT ALL ON public.library_books TO service_role;

ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active books"
ON public.library_books FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Staff can manage books"
ON public.library_books FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_library_books_updated_at
BEFORE UPDATE ON public.library_books
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX library_books_kind_idx ON public.library_books (kind, is_active, sort_order);
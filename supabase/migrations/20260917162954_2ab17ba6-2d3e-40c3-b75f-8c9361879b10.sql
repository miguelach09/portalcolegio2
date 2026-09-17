CREATE TABLE public.document_chunks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL CHECK (source IN ('documents','assistant_knowledge')),
  source_id uuid NOT NULL,
  title text NOT NULL,
  chunk_index integer NOT NULL DEFAULT 0,
  page integer,
  content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.document_chunks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_chunks TO authenticated;
GRANT ALL ON public.document_chunks TO service_role;

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active chunks"
ON public.document_chunks FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Staff can manage chunks"
ON public.document_chunks FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE INDEX document_chunks_source_idx ON public.document_chunks (source, source_id);
CREATE INDEX document_chunks_fts_idx ON public.document_chunks USING GIN (to_tsvector('spanish', content));
CREATE UNIQUE INDEX document_chunks_unique_idx ON public.document_chunks (source, source_id, chunk_index);

CREATE TRIGGER update_document_chunks_updated_at
BEFORE UPDATE ON public.document_chunks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
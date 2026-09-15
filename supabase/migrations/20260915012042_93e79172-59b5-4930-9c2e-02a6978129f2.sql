CREATE TABLE public.assistant_knowledge (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  tags text,
  file_path text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.assistant_knowledge TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_knowledge TO authenticated;
GRANT ALL ON public.assistant_knowledge TO service_role;

ALTER TABLE public.assistant_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assistant_knowledge_public_read_active"
  ON public.assistant_knowledge FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "assistant_knowledge_authenticated_read"
  ON public.assistant_knowledge FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "assistant_knowledge_staff_manage"
  ON public.assistant_knowledge FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_assistant_knowledge_updated_at
  BEFORE UPDATE ON public.assistant_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
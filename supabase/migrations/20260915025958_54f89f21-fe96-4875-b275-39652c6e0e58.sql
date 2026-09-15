CREATE TABLE public.file_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  title text,
  file_path text,
  file_name text,
  file_extension text,
  file_size integer,
  file_type text,
  actor_id uuid,
  actor_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.file_audit_log TO authenticated;
GRANT ALL ON public.file_audit_log TO service_role;

ALTER TABLE public.file_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read file audit log"
ON public.file_audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE INDEX file_audit_log_created_at_idx ON public.file_audit_log (created_at DESC);

CREATE OR REPLACE FUNCTION public.log_file_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec jsonb;
  v_action text;
  v_path text;
  v_old_path text;
  v_title text;
  v_name text;
  v_ext text;
  v_size integer;
  v_type text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    rec := to_jsonb(OLD);
    v_action := 'eliminado';
  ELSIF TG_OP = 'INSERT' THEN
    rec := to_jsonb(NEW);
    v_action := 'agregado';
  ELSE
    rec := to_jsonb(NEW);
    v_action := 'modificado';
  END IF;

  v_path := COALESCE(rec->>'file_path', rec->>'image_path', rec->>'cover_path');
  v_title := COALESCE(rec->>'title', rec->>'question');

  IF TG_OP = 'UPDATE' THEN
    v_old_path := COALESCE(
      to_jsonb(OLD)->>'file_path',
      to_jsonb(OLD)->>'image_path',
      to_jsonb(OLD)->>'cover_path'
    );
    IF v_old_path IS DISTINCT FROM v_path THEN
      v_action := 'archivo reemplazado';
    END IF;
  END IF;

  v_name := regexp_replace(COALESCE(v_path, ''), '^.*/', '');
  IF v_name = '' THEN v_name := NULL; END IF;
  v_ext := lower(NULLIF(regexp_replace(COALESCE(v_name, ''), '^.*\.', ''), COALESCE(v_name, '')));
  v_size := NULLIF(rec->>'file_size', '')::integer;
  v_type := rec->>'file_type';

  INSERT INTO public.file_audit_log (
    entity, entity_id, action, title, file_path, file_name,
    file_extension, file_size, file_type, actor_id, actor_email
  ) VALUES (
    TG_TABLE_NAME,
    NULLIF(rec->>'id', '')::uuid,
    v_action,
    v_title,
    v_path,
    v_name,
    v_ext,
    v_size,
    v_type,
    auth.uid(),
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'email'
  );

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_documents_files
AFTER INSERT OR UPDATE OR DELETE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.log_file_change();

CREATE TRIGGER log_gallery_files
AFTER INSERT OR UPDATE OR DELETE ON public.gallery_images
FOR EACH ROW EXECUTE FUNCTION public.log_file_change();

CREATE TRIGGER log_library_files
AFTER INSERT OR UPDATE OR DELETE ON public.library_books
FOR EACH ROW EXECUTE FUNCTION public.log_file_change();

CREATE TRIGGER log_hero_files
AFTER INSERT OR UPDATE OR DELETE ON public.hero_slides
FOR EACH ROW EXECUTE FUNCTION public.log_file_change();

CREATE TRIGGER log_knowledge_files
AFTER INSERT OR UPDATE OR DELETE ON public.assistant_knowledge
FOR EACH ROW EXECUTE FUNCTION public.log_file_change();

CREATE TRIGGER log_news_files
AFTER INSERT OR UPDATE OR DELETE ON public.news
FOR EACH ROW EXECUTE FUNCTION public.log_file_change();
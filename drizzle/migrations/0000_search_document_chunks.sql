CREATE OR REPLACE FUNCTION public.search_document_chunks(q text, max_rows int DEFAULT 24)
RETURNS TABLE(title text, page int, content text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT c.title, c.page, c.content
  FROM public.document_chunks c
  WHERE c.is_active AND to_tsvector('spanish', c.title || ' ' || c.content) @@ websearch_to_tsquery('spanish', q)
  ORDER BY ts_rank(to_tsvector('spanish', c.title || ' ' || c.content), websearch_to_tsquery('spanish', q)) DESC
  LIMIT LEAST(GREATEST(max_rows, 1), 50);
$$;
GRANT EXECUTE ON FUNCTION public.search_document_chunks(text, int) TO anon, authenticated, service_role;
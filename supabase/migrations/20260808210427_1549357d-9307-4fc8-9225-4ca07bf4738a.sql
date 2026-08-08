REVOKE ALL ON FUNCTION public.is_guardian_of(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_guardian_of(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_guardian_of(uuid, uuid) TO authenticated;
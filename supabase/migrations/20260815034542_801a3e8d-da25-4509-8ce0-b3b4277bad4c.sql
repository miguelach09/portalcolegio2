REVOKE ALL ON FUNCTION public.can_view_notification(uuid, text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_view_notification(uuid, text, text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.can_view_notification(uuid, text, text, uuid) TO authenticated;
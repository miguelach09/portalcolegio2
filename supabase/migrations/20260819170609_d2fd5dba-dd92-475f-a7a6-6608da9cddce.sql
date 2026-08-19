CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

ALTER FUNCTION public.is_guardian_of(uuid, uuid) SET SCHEMA private;
ALTER FUNCTION public.can_view_notification(uuid, text, text, uuid) SET SCHEMA private;

ALTER FUNCTION private.is_guardian_of(uuid, uuid) SET search_path = public;
ALTER FUNCTION private.can_view_notification(uuid, text, text, uuid) SET search_path = public;

REVOKE ALL ON FUNCTION private.is_guardian_of(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.can_view_notification(uuid, text, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_guardian_of(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_view_notification(uuid, text, text, uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Guardians can read their students" ON public.students;
CREATE POLICY "Guardians can read their students" ON public.students
  FOR SELECT TO authenticated
  USING (private.is_guardian_of(auth.uid(), id));

DROP POLICY IF EXISTS "Guardians read their notifications" ON public.notifications;
CREATE POLICY "Guardians read their notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (private.can_view_notification(auth.uid(), audience, grade, student_id));
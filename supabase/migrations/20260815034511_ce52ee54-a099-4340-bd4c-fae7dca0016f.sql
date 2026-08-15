CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  link text,
  audience text NOT NULL DEFAULT 'all',
  grade text,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_view_notification(_user_id uuid, _audience text, _grade text, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _audience = 'all' THEN EXISTS (
      SELECT 1 FROM public.student_guardians sg WHERE sg.user_id = _user_id
    )
    WHEN _audience = 'grade' THEN EXISTS (
      SELECT 1 FROM public.student_guardians sg
      JOIN public.students s ON s.id = sg.student_id
      WHERE sg.user_id = _user_id AND s.grade = _grade
    )
    WHEN _audience = 'student' THEN EXISTS (
      SELECT 1 FROM public.student_guardians sg
      WHERE sg.user_id = _user_id AND sg.student_id = _student_id
    )
    ELSE false
  END
$$;

CREATE POLICY "Staff manage notifications"
ON public.notifications FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Guardians read their notifications"
ON public.notifications FOR SELECT TO authenticated
USING (public.can_view_notification(auth.uid(), audience, grade, student_id));

CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.notification_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (notification_id, user_id)
);

GRANT SELECT, INSERT ON public.notification_reads TO authenticated;
GRANT ALL ON public.notification_reads TO service_role;

ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notification reads"
ON public.notification_reads FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own notification reads"
ON public.notification_reads FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff read notification reads"
ON public.notification_reads FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
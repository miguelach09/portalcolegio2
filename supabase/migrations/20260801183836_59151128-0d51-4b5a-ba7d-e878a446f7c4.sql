-- Añadir rol editor al enum app_role (debe confirmarse antes de usarse en políticas)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';

-- Añadir status y scheduled_at a news
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone;

-- Actualizar policy de news: los drafts no son públicos
DROP POLICY IF EXISTS "Public can read active news" ON public.news;
CREATE POLICY "Public can read active news" ON public.news
  FOR SELECT TO anon
  USING (is_active = true AND (status = 'published'));

CREATE TYPE public.document_category AS ENUM ('circulares', 'revisas', 'admisiones', 'herramientas', 'general');
CREATE TYPE public.news_category AS ENUM ('institucional', 'academico', 'deporte', 'arte', 'bienestar');
CREATE TYPE public.gallery_category AS ENUM ('aulas', 'deporte', 'arte', 'ciencia', 'biblioteca', 'instalaciones', 'eventos', 'graduacion');
CREATE TYPE public.app_role AS ENUM ('admin');

GRANT USAGE ON TYPE public.document_category TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.news_category TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.gallery_category TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.app_role TO authenticated, service_role;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, DELETE ON public.user_roles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category public.document_category NOT NULL DEFAULT 'general',
  file_path text NOT NULL,
  file_url text,
  file_size integer,
  file_type text,
  published_at date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.documents TO anon;
GRANT SELECT ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active documents" ON public.documents
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Admins can manage documents" ON public.documents
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  content text,
  image_url text,
  category public.news_category NOT NULL DEFAULT 'institucional',
  published_at date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.news TO anon;
GRANT SELECT ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active news" ON public.news
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Admins can manage news" ON public.news
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category public.gallery_category NOT NULL DEFAULT 'eventos',
  image_url text NOT NULL,
  image_path text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active gallery images" ON public.gallery_images
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Admins can manage gallery images" ON public.gallery_images
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for site-assets bucket
CREATE POLICY "Allow public read on site-assets" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'site-assets');

CREATE POLICY "Allow authenticated read on site-assets" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'site-assets');

CREATE POLICY "Allow admin insert on site-assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'site-assets'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Allow admin update on site-assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'site-assets'
    AND public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    bucket_id = 'site-assets'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Allow admin delete on site-assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'site-assets'
    AND public.has_role(auth.uid(), 'admin')
  );
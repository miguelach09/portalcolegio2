ALTER TABLE public.documents ADD COLUMN period smallint;
ALTER TABLE public.documents ADD CONSTRAINT documents_period_check CHECK (period IS NULL OR period BETWEEN 1 AND 4);
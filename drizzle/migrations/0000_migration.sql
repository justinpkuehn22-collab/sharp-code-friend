CREATE TABLE public.shelf_state (
  id integer PRIMARY KEY DEFAULT 1,
  poems jsonb NOT NULL DEFAULT '[]'::jsonb,
  shelf_sizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.shelf_state TO service_role;
ALTER TABLE public.shelf_state ENABLE ROW LEVEL SECURITY;
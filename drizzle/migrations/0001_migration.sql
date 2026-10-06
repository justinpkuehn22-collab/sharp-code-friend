CREATE TABLE public.shelf_history (
  id bigserial PRIMARY KEY,
  poems jsonb NOT NULL,
  shelf_sizes jsonb NOT NULL,
  saved_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.shelf_history TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.shelf_history_id_seq TO service_role;
ALTER TABLE public.shelf_history ENABLE ROW LEVEL SECURITY;
INSERT INTO public.shelf_history (poems, shelf_sizes) SELECT poems, shelf_sizes FROM public.shelf_state;
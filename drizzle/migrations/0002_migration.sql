-- Failed sign-in attempts, used to slow down code guessing. Only keyed hashes of IPs are stored.
CREATE TABLE IF NOT EXISTS public.shelf_login_attempts (
  id bigserial PRIMARY KEY,
  ip_hash text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shelf_login_attempts_ip_time_idx ON public.shelf_login_attempts (ip_hash, attempted_at);
CREATE INDEX IF NOT EXISTS shelf_login_attempts_time_idx ON public.shelf_login_attempts (attempted_at);
GRANT ALL ON public.shelf_login_attempts TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.shelf_login_attempts_id_seq TO service_role;
ALTER TABLE public.shelf_login_attempts ENABLE ROW LEVEL SECURITY;

-- Lock every shelf table down: only the edge function (service role) may touch them.
REVOKE ALL ON public.shelf_state FROM anon, authenticated;
REVOKE ALL ON public.shelf_history FROM anon, authenticated;
REVOKE ALL ON public.shelf_login_attempts FROM anon, authenticated;

-- Old attempts are useless after the window; clear anything older than a day.
DELETE FROM public.shelf_login_attempts WHERE attempted_at < now() - interval '1 day';

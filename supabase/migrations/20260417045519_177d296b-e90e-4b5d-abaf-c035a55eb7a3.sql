CREATE TABLE IF NOT EXISTS public.nhk_reading_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  read_date DATE NOT NULL DEFAULT CURRENT_DATE,
  level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, read_date)
);

CREATE INDEX IF NOT EXISTS nhk_reading_log_user_date_idx
  ON public.nhk_reading_log (user_id, read_date DESC);

ALTER TABLE public.nhk_reading_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nhk reading log"
  ON public.nhk_reading_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nhk reading log"
  ON public.nhk_reading_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
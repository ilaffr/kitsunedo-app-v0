CREATE TABLE public.kitsune_tales (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  tale_date date NOT NULL DEFAULT CURRENT_DATE,
  story_jp text NOT NULL,
  story_furigana text,
  translation text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_index integer NOT NULL,
  vocab_used jsonb,
  completed boolean NOT NULL DEFAULT false,
  xp_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tale_date)
);

ALTER TABLE public.kitsune_tales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tales" ON public.kitsune_tales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tales" ON public.kitsune_tales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tales" ON public.kitsune_tales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_kitsune_tales_user_date ON public.kitsune_tales(user_id, tale_date DESC);

CREATE TABLE public.practice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  practice_type TEXT NOT NULL DEFAULT 'kanji_writing',
  score_perfect INTEGER NOT NULL DEFAULT 0,
  score_close INTEGER NOT NULL DEFAULT 0,
  score_missed INTEGER NOT NULL DEFAULT 0,
  total_items INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own sessions" ON public.practice_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON public.practice_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

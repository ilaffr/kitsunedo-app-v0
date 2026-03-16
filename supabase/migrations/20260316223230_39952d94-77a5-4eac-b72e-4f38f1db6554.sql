
CREATE TABLE public.placement_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  level text NOT NULL DEFAULT 'N5',
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  vocab_score integer NOT NULL DEFAULT 0,
  grammar_score integer NOT NULL DEFAULT 0,
  reading_score integer NOT NULL DEFAULT 0,
  listening_score integer NOT NULL DEFAULT 0,
  unlocked_up_to integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.placement_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own placement results" ON public.placement_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own placement results" ON public.placement_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own placement results" ON public.placement_results
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

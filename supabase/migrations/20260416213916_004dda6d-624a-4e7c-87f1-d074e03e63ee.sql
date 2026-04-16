
CREATE TABLE public.jlpt_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL CHECK (level IN ('N5','N4','N3','N2','N1')),
  section text NOT NULL CHECK (section IN ('vocab','grammar','reading')),
  question_jp text NOT NULL,
  passage_jp text,
  options jsonb NOT NULL,
  correct_index integer NOT NULL,
  explanation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.jlpt_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read jlpt questions"
ON public.jlpt_questions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert jlpt questions"
ON public.jlpt_questions
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE INDEX idx_jlpt_questions_level_section ON public.jlpt_questions(level, section);

CREATE TABLE public.jlpt_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  level text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('mixed','vocab','grammar','reading')),
  total_questions integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  xp_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.jlpt_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jlpt sessions"
ON public.jlpt_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jlpt sessions"
ON public.jlpt_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);


-- mistake_log table
CREATE TABLE public.mistake_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lesson_id text NOT NULL,
  word text NOT NULL,
  mistake_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id, word)
);

ALTER TABLE public.mistake_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mistakes" ON public.mistake_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mistakes" ON public.mistake_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mistakes" ON public.mistake_log
  FOR UPDATE USING (auth.uid() = user_id);

-- personal_badges table
CREATE TABLE public.personal_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  trigger_type text NOT NULL,
  trigger_detail text NOT NULL,
  tier integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  title_jp text,
  description text,
  myth text,
  image_url text,
  rarity text NOT NULL DEFAULT 'uncommon',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, trigger_type, trigger_detail, tier)
);

ALTER TABLE public.personal_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON public.personal_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON public.personal_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- badge-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('badge-images', 'badge-images', true);

CREATE POLICY "Anyone can read badge images" ON storage.objects
  FOR SELECT USING (bucket_id = 'badge-images');

CREATE POLICY "Authenticated users can upload badge images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'badge-images' AND auth.role() = 'authenticated');

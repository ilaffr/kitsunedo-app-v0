CREATE TABLE public.nhk_news_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id text NOT NULL,
  level text NOT NULL CHECK (level IN ('N5','N4','N3','N2','N1')),
  source text NOT NULL CHECK (source IN ('easy','regular')),
  title text NOT NULL,
  summary text,
  body_html text,
  audio_url text,
  source_url text NOT NULL,
  published_at timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (news_id, level)
);

CREATE INDEX idx_nhk_news_cache_level_fetched ON public.nhk_news_cache (level, fetched_at DESC);

ALTER TABLE public.nhk_news_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read nhk news cache"
ON public.nhk_news_cache
FOR SELECT
USING (true);

ALTER TABLE public.nhk_news_cache ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'top';

-- Drop old unique constraint if it exists and recreate with category
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'nhk_news_cache_news_id_level_key'
  ) THEN
    ALTER TABLE public.nhk_news_cache DROP CONSTRAINT nhk_news_cache_news_id_level_key;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS nhk_news_cache_news_level_category_idx
  ON public.nhk_news_cache (news_id, level, category);

CREATE INDEX IF NOT EXISTS nhk_news_cache_level_category_fetched_idx
  ON public.nhk_news_cache (level, category, fetched_at DESC);
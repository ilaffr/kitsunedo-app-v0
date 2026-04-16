ALTER TABLE public.kitsune_tales
  ADD COLUMN IF NOT EXISTS theme text,
  ADD COLUMN IF NOT EXISTS cultural_note text,
  ADD COLUMN IF NOT EXISTS title text;
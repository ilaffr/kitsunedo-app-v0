
-- Add image_url column to flashcards
ALTER TABLE public.flashcards ADD COLUMN IF NOT EXISTS image_url text;

-- Create storage bucket for flashcard images
INSERT INTO storage.buckets (id, name, public) VALUES ('flashcard-images', 'flashcard-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload flashcard images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'flashcard-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access
CREATE POLICY "Public read flashcard images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'flashcard-images');

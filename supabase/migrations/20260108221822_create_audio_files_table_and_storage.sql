/*
  # Audio Files Storage System

  This migration creates:
  1. New Table: `audio_files`
     - Tracks all generated audio files stored in S3
     - Links audio to users and optionally to stories
     - Stores metadata like file size, duration, and content type

  2. Security
     - RLS enabled with policies for authenticated users
     - Users can only access their own audio files

  3. Storage Bucket
     - Creates `user-files` bucket for audio storage if not exists
*/

-- Create audio_files table
CREATE TABLE IF NOT EXISTS audio_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  duration numeric,
  content_type text NOT NULL DEFAULT 'audio/mpeg',
  story_id uuid REFERENCES stories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_audio_files_user_id ON audio_files(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_story_id ON audio_files(story_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_created_at ON audio_files(created_at DESC);

-- Enable RLS
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own audio files"
  ON audio_files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audio files"
  ON audio_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audio files"
  ON audio_files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own audio files"
  ON audio_files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for user files if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-files',
  'user-files',
  true,
  52428800,
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'application/pdf', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for user-files bucket
DO $$
BEGIN
  -- Policy for authenticated users to upload to their folder
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload to own folder'
  ) THEN
    CREATE POLICY "Users can upload to own folder"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'user-files' AND
        (storage.foldername(name))[1] = 'audio' AND
        (storage.foldername(name))[2] = auth.uid()::text
      );
  END IF;

  -- Policy for public read access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read access for user-files'
  ) THEN
    CREATE POLICY "Public read access for user-files"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'user-files');
  END IF;

  -- Policy for users to delete their own files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own files'
  ) THEN
    CREATE POLICY "Users can delete own files"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'user-files' AND
        (storage.foldername(name))[1] = 'audio' AND
        (storage.foldername(name))[2] = auth.uid()::text
      );
  END IF;
END $$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_audio_files_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_audio_files_updated_at ON audio_files;
CREATE TRIGGER update_audio_files_updated_at
  BEFORE UPDATE ON audio_files
  FOR EACH ROW
  EXECUTE FUNCTION update_audio_files_updated_at();

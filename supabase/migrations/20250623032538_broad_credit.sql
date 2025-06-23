/*
  # Stories Management Schema

  1. New Tables
    - `stories`: User-generated stories with TTS capabilities
      - Stores story content, metadata, and audio references
      - Links to users via `user_id`
      - Supports categorization and tagging
      - Tracks play counts and public/private status

  2. Functions
    - `increment_play_count`: Safely increment story play count

  3. Security
    - Enable RLS on stories table
    - Users can manage their own stories
    - Public stories are readable by all authenticated users
*/

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'folklore',
  tags text[] DEFAULT '{}',
  voice_id text NOT NULL,
  voice_settings jsonb DEFAULT '{}',
  audio_url text,
  duration integer, -- in seconds
  is_public boolean DEFAULT false,
  play_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Users can manage their own stories
CREATE POLICY "Users can manage own stories"
  ON stories
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- All authenticated users can read public stories
CREATE POLICY "Public stories are readable"
  ON stories
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS stories_user_id_idx ON stories(user_id);
CREATE INDEX IF NOT EXISTS stories_category_idx ON stories(category);
CREATE INDEX IF NOT EXISTS stories_is_public_idx ON stories(is_public);
CREATE INDEX IF NOT EXISTS stories_play_count_idx ON stories(play_count DESC);
CREATE INDEX IF NOT EXISTS stories_created_at_idx ON stories(created_at DESC);

-- Function to safely increment play count
CREATE OR REPLACE FUNCTION increment_play_count(story_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE stories 
  SET play_count = play_count + 1 
  WHERE id = story_id;
END;
$$;

-- Create storage bucket for user files
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-files');

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);
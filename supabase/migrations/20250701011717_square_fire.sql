/*
  # Custom Voices Table
  
  1. New Table
    - `custom_voices`: Stores user-generated voice designs
      - Links to Supabase users via `user_id`
      - Stores voice_id, name, description and settings
      - Includes preview URL for audio sample
      
  2. Security
    - Enables Row Level Security (RLS)
    - Users can manage their own custom voices
*/

CREATE TABLE IF NOT EXISTS custom_voices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  voice_id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  voice_settings jsonb DEFAULT '{}'::jsonb,
  preview_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE custom_voices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own custom voices"
  ON custom_voices
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS custom_voices_user_id_idx ON custom_voices(user_id);
CREATE INDEX IF NOT EXISTS custom_voices_created_at_idx ON custom_voices(created_at DESC);
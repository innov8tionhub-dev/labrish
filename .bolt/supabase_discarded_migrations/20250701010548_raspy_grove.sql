/*
  # Create custom voices table

  1. New Tables
    - `custom_voices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `voice_id` (text, ElevenLabs voice ID)
      - `name` (text, user-defined name)
      - `description` (text, voice description)
      - `voice_settings` (jsonb, ElevenLabs settings)
      - `preview_url` (text, audio preview URL)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `custom_voices` table
    - Add policy for users to manage their own voices
*/

CREATE TABLE IF NOT EXISTS custom_voices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
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
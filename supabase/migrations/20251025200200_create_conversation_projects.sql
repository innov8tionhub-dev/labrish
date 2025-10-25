/*
  # Multi-Voice Conversation Projects

  1. New Tables
    - `conversation_projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text) - Project title
      - `description` (text) - Project description
      - `category` (text) - dialogue, interview, debate, story, other
      - `status` (text) - draft, generating, completed, failed
      - `audio_url` (text) - Final combined audio URL
      - `duration` (integer) - Total duration in seconds
      - `metadata` (jsonb) - Additional project data
      - `is_public` (boolean)
      - `play_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `conversation_segments`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversation_projects)
      - `sequence_order` (integer) - Order in conversation
      - `speaker_name` (text) - Character/speaker name
      - `voice_id` (text) - ElevenLabs voice ID
      - `voice_settings` (jsonb) - Voice configuration
      - `text_content` (text) - Text to speak
      - `audio_url` (text) - Generated segment audio
      - `duration` (integer) - Segment duration in seconds
      - `pause_after` (integer) - Pause duration after segment (ms)
      - `metadata` (jsonb) - Additional segment data
      - `created_at` (timestamptz)

    - `conversation_characters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - Character name
      - `description` (text) - Character description
      - `voice_id` (text) - Default voice ID
      - `voice_settings` (jsonb) - Default voice settings
      - `avatar_url` (text) - Character avatar image
      - `metadata` (jsonb) - Additional character data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can manage their own projects, segments, and characters
    - Public projects are readable by all authenticated users

  3. Indexes
    - Index on user_id, conversation_id, sequence_order
*/

-- Create conversation category enum
DO $$ BEGIN
  CREATE TYPE conversation_category AS ENUM ('dialogue', 'interview', 'debate', 'story', 'podcast', 'audiobook', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create conversation status enum
DO $$ BEGIN
  CREATE TYPE conversation_status AS ENUM ('draft', 'generating', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create conversation_projects table
CREATE TABLE IF NOT EXISTS conversation_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category conversation_category DEFAULT 'other',
  status conversation_status DEFAULT 'draft',
  audio_url text,
  duration integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  is_public boolean DEFAULT false,
  play_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation_segments table
CREATE TABLE IF NOT EXISTS conversation_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversation_projects(id) ON DELETE CASCADE NOT NULL,
  sequence_order integer NOT NULL,
  speaker_name text NOT NULL,
  voice_id text NOT NULL,
  voice_settings jsonb DEFAULT '{"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": true}',
  text_content text NOT NULL,
  audio_url text,
  duration integer DEFAULT 0,
  pause_after integer DEFAULT 500,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, sequence_order)
);

-- Create conversation_characters table
CREATE TABLE IF NOT EXISTS conversation_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  voice_id text NOT NULL,
  voice_settings jsonb DEFAULT '{"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": true}',
  avatar_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_characters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_projects

-- Users can manage their own projects
CREATE POLICY "Users can manage own conversation projects"
  ON conversation_projects
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can view public projects
CREATE POLICY "Users can view public conversation projects"
  ON conversation_projects
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- RLS Policies for conversation_segments

-- Users can manage segments of their own projects
CREATE POLICY "Users can manage own conversation segments"
  ON conversation_segments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_projects
      WHERE id = conversation_segments.conversation_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_projects
      WHERE id = conversation_segments.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Users can view segments of public projects
CREATE POLICY "Users can view public conversation segments"
  ON conversation_segments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_projects
      WHERE id = conversation_segments.conversation_id
      AND is_public = true
    )
  );

-- RLS Policies for conversation_characters

-- Users can manage their own characters
CREATE POLICY "Users can manage own characters"
  ON conversation_characters
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS conversation_projects_user_id_idx ON conversation_projects(user_id);
CREATE INDEX IF NOT EXISTS conversation_projects_category_idx ON conversation_projects(category);
CREATE INDEX IF NOT EXISTS conversation_projects_status_idx ON conversation_projects(status);
CREATE INDEX IF NOT EXISTS conversation_projects_is_public_idx ON conversation_projects(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS conversation_projects_created_at_idx ON conversation_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS conversation_segments_conversation_id_idx ON conversation_segments(conversation_id);
CREATE INDEX IF NOT EXISTS conversation_segments_sequence_order_idx ON conversation_segments(conversation_id, sequence_order);
CREATE INDEX IF NOT EXISTS conversation_characters_user_id_idx ON conversation_characters(user_id);

-- Function to update conversation project updated_at
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS conversation_projects_updated_at_trigger ON conversation_projects;
CREATE TRIGGER conversation_projects_updated_at_trigger
BEFORE UPDATE ON conversation_projects
FOR EACH ROW
EXECUTE FUNCTION update_conversation_updated_at();

DROP TRIGGER IF EXISTS conversation_characters_updated_at_trigger ON conversation_characters;
CREATE TRIGGER conversation_characters_updated_at_trigger
BEFORE UPDATE ON conversation_characters
FOR EACH ROW
EXECUTE FUNCTION update_conversation_updated_at();

-- Function to increment conversation play count
CREATE OR REPLACE FUNCTION increment_conversation_play_count(project_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE conversation_projects
  SET play_count = play_count + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

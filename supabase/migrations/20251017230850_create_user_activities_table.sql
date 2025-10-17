/*
  # User Activities Tracking Schema

  1. New Table
    - `user_activities`: Tracks all user actions and events
      - `id`: Primary key
      - `user_id`: References auth.users
      - `activity_type`: Type of activity (story_created, audio_generated, etc.)
      - `entity_type`: Type of entity involved (story, audio, voice, etc.)
      - `entity_id`: ID of the entity (nullable for general activities)
      - `metadata`: JSONB field for additional activity-specific data
      - `created_at`: Timestamp of the activity

  2. Security
    - Enable RLS on user_activities table
    - Users can only view and create their own activities

  3. Indexes
    - Index on user_id for efficient querying
    - Index on created_at for sorting recent activities
    - Index on activity_type for filtering by type
*/

-- Create activity type enum
DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM (
    'story_created',
    'story_updated',
    'story_deleted',
    'audio_generated',
    'voice_trained',
    'voice_created',
    'story_shared',
    'story_played',
    'account_upgraded',
    'feature_used'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activities
CREATE POLICY "Users can view own activities"
  ON user_activities
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can create their own activities
CREATE POLICY "Users can create own activities"
  ON user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_activities_user_id_idx ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS user_activities_created_at_idx ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS user_activities_type_idx ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS user_activities_user_created_idx ON user_activities(user_id, created_at DESC);

-- Helper function to log activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id uuid,
  p_activity_type activity_type,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activity_id uuid;
BEGIN
  INSERT INTO user_activities (user_id, activity_type, entity_type, entity_id, metadata)
  VALUES (p_user_id, p_activity_type, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;
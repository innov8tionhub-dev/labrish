/*
  # Offline Cache Management System

  1. New Tables
    - `offline_cache_manifest`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `story_id` (uuid, references stories)
      - `audio_url` (text) - URL to cached audio
      - `cache_size` (bigint) - Size in bytes
      - `download_status` (text) - pending, downloading, cached, failed
      - `expires_at` (timestamptz) - Cache expiration date
      - `last_accessed` (timestamptz) - Last time accessed
      - `metadata` (jsonb) - Story metadata for offline display
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `offline_sync_queue`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `action_type` (text) - create_story, update_story, submit_feedback, log_activity
      - `payload` (jsonb) - Action data to sync
      - `status` (text) - queued, syncing, synced, failed
      - `retry_count` (integer) - Number of retry attempts
      - `error_message` (text) - Error details if failed
      - `created_at` (timestamptz)
      - `synced_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only manage their own cache entries
    - Users can only access their own sync queue

  3. Indexes
    - Index on user_id, story_id, download_status
    - Index on expires_at for cleanup
*/

-- Create download status enum
DO $$ BEGIN
  CREATE TYPE download_status AS ENUM ('pending', 'downloading', 'cached', 'failed', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create sync status enum
DO $$ BEGIN
  CREATE TYPE sync_status AS ENUM ('queued', 'syncing', 'synced', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create offline_cache_manifest table
CREATE TABLE IF NOT EXISTS offline_cache_manifest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  audio_url text NOT NULL,
  cache_size bigint DEFAULT 0,
  download_status download_status DEFAULT 'pending',
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  last_accessed timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Create offline_sync_queue table
CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status sync_status DEFAULT 'queued',
  retry_count integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now(),
  synced_at timestamptz
);

-- Enable RLS
ALTER TABLE offline_cache_manifest ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offline_cache_manifest

-- Users can manage their own cache entries
CREATE POLICY "Users can manage own cache"
  ON offline_cache_manifest
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for offline_sync_queue

-- Users can manage their own sync queue
CREATE POLICY "Users can manage own sync queue"
  ON offline_sync_queue
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS offline_cache_user_id_idx ON offline_cache_manifest(user_id);
CREATE INDEX IF NOT EXISTS offline_cache_story_id_idx ON offline_cache_manifest(story_id);
CREATE INDEX IF NOT EXISTS offline_cache_status_idx ON offline_cache_manifest(download_status);
CREATE INDEX IF NOT EXISTS offline_cache_expires_at_idx ON offline_cache_manifest(expires_at);
CREATE INDEX IF NOT EXISTS offline_cache_last_accessed_idx ON offline_cache_manifest(last_accessed);
CREATE INDEX IF NOT EXISTS offline_sync_user_id_idx ON offline_sync_queue(user_id);
CREATE INDEX IF NOT EXISTS offline_sync_status_idx ON offline_sync_queue(status);
CREATE INDEX IF NOT EXISTS offline_sync_created_at_idx ON offline_sync_queue(created_at);

-- Function to update last_accessed timestamp
CREATE OR REPLACE FUNCTION update_cache_last_accessed(cache_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE offline_cache_manifest
  SET last_accessed = now()
  WHERE id = cache_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM offline_cache_manifest
  WHERE expires_at < now() AND download_status = 'expired';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update cache updated_at timestamp
CREATE OR REPLACE FUNCTION update_offline_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for offline_cache_manifest
DROP TRIGGER IF EXISTS offline_cache_updated_at_trigger ON offline_cache_manifest;
CREATE TRIGGER offline_cache_updated_at_trigger
BEFORE UPDATE ON offline_cache_manifest
FOR EACH ROW
EXECUTE FUNCTION update_offline_cache_updated_at();

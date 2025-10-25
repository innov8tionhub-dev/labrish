/*
  # Batch Generation Job Management

  1. New Tables
    - `batch_generation_jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text) - Job title/name
      - `description` (text) - Job description
      - `voice_id` (text) - Voice for all items
      - `voice_settings` (jsonb) - Voice configuration
      - `status` (text) - queued, processing, completed, failed, cancelled
      - `total_items` (integer) - Total number of texts
      - `processed_items` (integer) - Number processed
      - `failed_items` (integer) - Number failed
      - `progress_percentage` (integer) - 0-100
      - `estimated_completion` (timestamptz) - Estimated finish time
      - `zip_url` (text) - URL to download all files
      - `error_message` (text) - Error details if failed
      - `metadata` (jsonb) - Additional job data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `completed_at` (timestamptz)

    - `batch_generation_items`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references batch_generation_jobs)
      - `sequence_order` (integer) - Order in batch
      - `item_name` (text) - Individual item name
      - `text_content` (text) - Text to convert
      - `audio_url` (text) - Generated audio URL
      - `duration` (integer) - Audio duration in seconds
      - `status` (text) - pending, processing, completed, failed
      - `error_message` (text) - Error if failed
      - `metadata` (jsonb) - Additional item data
      - `created_at` (timestamptz)
      - `processed_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only manage their own jobs and items

  3. Indexes
    - Index on user_id, job_id, status
*/

-- Create batch job status enum
DO $$ BEGIN
  CREATE TYPE batch_job_status AS ENUM ('queued', 'processing', 'completed', 'failed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create batch item status enum
DO $$ BEGIN
  CREATE TYPE batch_item_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'skipped');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create batch_generation_jobs table
CREATE TABLE IF NOT EXISTS batch_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  voice_id text NOT NULL,
  voice_settings jsonb DEFAULT '{"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": true}',
  status batch_job_status DEFAULT 'queued',
  total_items integer DEFAULT 0,
  processed_items integer DEFAULT 0,
  failed_items integer DEFAULT 0,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  estimated_completion timestamptz,
  zip_url text,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create batch_generation_items table
CREATE TABLE IF NOT EXISTS batch_generation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES batch_generation_jobs(id) ON DELETE CASCADE NOT NULL,
  sequence_order integer NOT NULL,
  item_name text NOT NULL,
  text_content text NOT NULL,
  audio_url text,
  duration integer DEFAULT 0,
  status batch_item_status DEFAULT 'pending',
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  UNIQUE(job_id, sequence_order)
);

-- Enable RLS
ALTER TABLE batch_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_generation_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for batch_generation_jobs

-- Users can manage their own batch jobs
CREATE POLICY "Users can manage own batch jobs"
  ON batch_generation_jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for batch_generation_items

-- Users can manage items of their own jobs
CREATE POLICY "Users can manage own batch items"
  ON batch_generation_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM batch_generation_jobs
      WHERE id = batch_generation_items.job_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM batch_generation_jobs
      WHERE id = batch_generation_items.job_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS batch_jobs_user_id_idx ON batch_generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS batch_jobs_status_idx ON batch_generation_jobs(status);
CREATE INDEX IF NOT EXISTS batch_jobs_created_at_idx ON batch_generation_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS batch_items_job_id_idx ON batch_generation_items(job_id);
CREATE INDEX IF NOT EXISTS batch_items_sequence_order_idx ON batch_generation_items(job_id, sequence_order);
CREATE INDEX IF NOT EXISTS batch_items_status_idx ON batch_generation_items(status);

-- Function to update batch job progress
CREATE OR REPLACE FUNCTION update_batch_job_progress(p_job_id uuid)
RETURNS void AS $$
DECLARE
  v_total integer;
  v_processed integer;
  v_failed integer;
  v_percentage integer;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status IN ('completed', 'failed', 'skipped')),
    COUNT(*) FILTER (WHERE status = 'failed')
  INTO v_total, v_processed, v_failed
  FROM batch_generation_items
  WHERE job_id = p_job_id;

  v_percentage := CASE
    WHEN v_total > 0 THEN (v_processed * 100 / v_total)
    ELSE 0
  END;

  UPDATE batch_generation_jobs
  SET
    total_items = v_total,
    processed_items = v_processed,
    failed_items = v_failed,
    progress_percentage = v_percentage,
    status = CASE
      WHEN v_processed = v_total AND v_failed = 0 THEN 'completed'::batch_job_status
      WHEN v_processed = v_total AND v_failed > 0 THEN 'completed'::batch_job_status
      ELSE status
    END,
    completed_at = CASE
      WHEN v_processed = v_total THEN now()
      ELSE completed_at
    END,
    updated_at = now()
  WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update batch job updated_at
CREATE OR REPLACE FUNCTION update_batch_job_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for batch_generation_jobs
DROP TRIGGER IF EXISTS batch_jobs_updated_at_trigger ON batch_generation_jobs;
CREATE TRIGGER batch_jobs_updated_at_trigger
BEFORE UPDATE ON batch_generation_jobs
FOR EACH ROW
EXECUTE FUNCTION update_batch_job_updated_at();

-- Trigger to update job progress when items change
CREATE OR REPLACE FUNCTION trigger_batch_job_progress_update()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM update_batch_job_progress(NEW.job_id);
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM update_batch_job_progress(NEW.job_id);
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM update_batch_job_progress(OLD.job_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger on batch_generation_items
DROP TRIGGER IF EXISTS batch_items_progress_trigger ON batch_generation_items;
CREATE TRIGGER batch_items_progress_trigger
AFTER INSERT OR UPDATE OR DELETE ON batch_generation_items
FOR EACH ROW
EXECUTE FUNCTION trigger_batch_job_progress_update();

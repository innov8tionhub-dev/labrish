/*
  # User Feedback System

  1. New Tables
    - `user_feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text) - feedback, bug, feature_request, nps_survey
      - `category` (text) - ui_ux, performance, content, voice_quality, pricing, other
      - `title` (text) - Brief title/summary
      - `content` (text) - Detailed feedback content
      - `rating` (integer) - 1-10 rating scale
      - `sentiment` (text) - positive, neutral, negative
      - `status` (text) - new, reviewing, planned, in_progress, completed, dismissed
      - `admin_response` (text) - Response from admin
      - `responded_at` (timestamptz) - When admin responded
      - `page_url` (text) - Page where feedback was submitted
      - `user_agent` (text) - Browser/device info
      - `metadata` (jsonb) - Additional context data
      - `votes` (integer) - Community votes for feature requests
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `feedback_votes`
      - `id` (uuid, primary key)
      - `feedback_id` (uuid, references user_feedback)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can create their own feedback
    - Users can read their own feedback and admin responses
    - Public feature requests are visible to all authenticated users
    - Users can vote on feature requests
    - Only admins can update status and add responses

  3. Indexes
    - Index on user_id, type, category, status, created_at
    - Index on votes for sorting popular requests
*/

-- Create feedback type enum
DO $$ BEGIN
  CREATE TYPE feedback_type AS ENUM ('feedback', 'bug', 'feature_request', 'nps_survey');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create feedback category enum
DO $$ BEGIN
  CREATE TYPE feedback_category AS ENUM ('ui_ux', 'performance', 'content', 'voice_quality', 'pricing', 'accessibility', 'mobile', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create feedback status enum
DO $$ BEGIN
  CREATE TYPE feedback_status AS ENUM ('new', 'reviewing', 'planned', 'in_progress', 'completed', 'dismissed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create feedback sentiment enum
DO $$ BEGIN
  CREATE TYPE feedback_sentiment AS ENUM ('positive', 'neutral', 'negative');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type feedback_type NOT NULL DEFAULT 'feedback',
  category feedback_category NOT NULL DEFAULT 'other',
  title text NOT NULL,
  content text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 10),
  sentiment feedback_sentiment DEFAULT 'neutral',
  status feedback_status NOT NULL DEFAULT 'new',
  admin_response text,
  responded_at timestamptz,
  page_url text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  votes integer DEFAULT 0,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create feedback_votes table
CREATE TABLE IF NOT EXISTS feedback_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid REFERENCES user_feedback(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(feedback_id, user_id)
);

-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_feedback

-- Users can create their own feedback
CREATE POLICY "Users can create own feedback"
  ON user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can view public feature requests
CREATE POLICY "Users can view public feature requests"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (is_public = true AND type = 'feature_request');

-- Users can update their own pending feedback
CREATE POLICY "Users can update own pending feedback"
  ON user_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'new')
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for feedback_votes

-- Users can vote on public feature requests
CREATE POLICY "Users can vote on feature requests"
  ON feedback_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_feedback
      WHERE id = feedback_id
      AND type = 'feature_request'
      AND is_public = true
    )
  );

-- Users can view their own votes
CREATE POLICY "Users can view own votes"
  ON feedback_votes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can remove their own votes
CREATE POLICY "Users can remove own votes"
  ON feedback_votes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS user_feedback_user_id_idx ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS user_feedback_type_idx ON user_feedback(type);
CREATE INDEX IF NOT EXISTS user_feedback_category_idx ON user_feedback(category);
CREATE INDEX IF NOT EXISTS user_feedback_status_idx ON user_feedback(status);
CREATE INDEX IF NOT EXISTS user_feedback_created_at_idx ON user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS user_feedback_votes_idx ON user_feedback(votes DESC);
CREATE INDEX IF NOT EXISTS user_feedback_is_public_idx ON user_feedback(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS feedback_votes_feedback_id_idx ON feedback_votes(feedback_id);
CREATE INDEX IF NOT EXISTS feedback_votes_user_id_idx ON feedback_votes(user_id);

-- Function to update vote count
CREATE OR REPLACE FUNCTION update_feedback_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE user_feedback
    SET votes = votes + 1
    WHERE id = NEW.feedback_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE user_feedback
    SET votes = votes - 1
    WHERE id = OLD.feedback_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update vote count
DROP TRIGGER IF EXISTS feedback_vote_count_trigger ON feedback_votes;
CREATE TRIGGER feedback_vote_count_trigger
AFTER INSERT OR DELETE ON feedback_votes
FOR EACH ROW
EXECUTE FUNCTION update_feedback_vote_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS user_feedback_updated_at_trigger ON user_feedback;
CREATE TRIGGER user_feedback_updated_at_trigger
BEFORE UPDATE ON user_feedback
FOR EACH ROW
EXECUTE FUNCTION update_user_feedback_updated_at();

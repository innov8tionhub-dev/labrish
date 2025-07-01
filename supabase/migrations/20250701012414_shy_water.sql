/*
  # User Generation Counts Schema

  1. New Table
    - `user_generation_counts`: Tracks monthly AI voice generation usage per user
      - Stores user_id, month (YYYY-MM format), generation_count
      - Has unique constraint on user_id and month
      - Tracks when the last generation occurred
      - Used for enforcing tier-based limits

  2. Security
    - Enable RLS on the table
    - Users can only view and update their own generation counts
*/

CREATE TABLE IF NOT EXISTS user_generation_counts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  generation_count INTEGER NOT NULL DEFAULT 0,
  last_generated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, month)
);

-- Enable Row Level Security
ALTER TABLE user_generation_counts ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own generation counts
CREATE POLICY "Users can view own generation counts"
  ON user_generation_counts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS user_generation_counts_user_id_idx ON user_generation_counts(user_id);
CREATE INDEX IF NOT EXISTS user_generation_counts_month_idx ON user_generation_counts(month);
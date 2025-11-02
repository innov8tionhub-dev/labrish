/*
  # Remove Remaining Multiple Permissive Policies

  1. Changes
    - Consolidate multiple permissive policies for conversation_projects table
    - Consolidate multiple permissive policies for conversation_segments table
    - Consolidate multiple permissive policies for creator_tips table
    - Consolidate multiple permissive policies for user_feedback table

  2. Security
    - Each table will have single optimized policies per action (SELECT, INSERT, UPDATE, DELETE)
    - Maintains proper authentication and ownership checks
    - Improves policy evaluation performance
*/

-- conversation_projects table
DROP POLICY IF EXISTS "Users can delete own conversation projects" ON conversation_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON conversation_projects;
DROP POLICY IF EXISTS "Users can view own conversation projects" ON conversation_projects;
DROP POLICY IF EXISTS "Users can view own projects" ON conversation_projects;
DROP POLICY IF EXISTS "Users can update own conversation projects" ON conversation_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON conversation_projects;

CREATE POLICY "Users can delete own projects"
  ON conversation_projects FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own projects"
  ON conversation_projects FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own projects"
  ON conversation_projects FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- conversation_segments table
DROP POLICY IF EXISTS "Users can delete own conversation segments" ON conversation_segments;
DROP POLICY IF EXISTS "Users can delete own segments" ON conversation_segments;
DROP POLICY IF EXISTS "Users can view own conversation segments" ON conversation_segments;
DROP POLICY IF EXISTS "Users can view own segments" ON conversation_segments;
DROP POLICY IF EXISTS "Users can update own conversation segments" ON conversation_segments;
DROP POLICY IF EXISTS "Users can update own segments" ON conversation_segments;

CREATE POLICY "Users can delete own segments"
  ON conversation_segments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_projects
      WHERE conversation_projects.id = conversation_segments.conversation_id
      AND conversation_projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can view own segments"
  ON conversation_segments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_projects
      WHERE conversation_projects.id = conversation_segments.conversation_id
      AND conversation_projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own segments"
  ON conversation_segments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_projects
      WHERE conversation_projects.id = conversation_segments.conversation_id
      AND conversation_projects.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_projects
      WHERE conversation_projects.id = conversation_segments.conversation_id
      AND conversation_projects.user_id = (SELECT auth.uid())
    )
  );

-- creator_tips table
DROP POLICY IF EXISTS "Anyone can view creator tips" ON creator_tips;
DROP POLICY IF EXISTS "Anyone can read creator tips" ON creator_tips;

CREATE POLICY "Anyone can view creator tips"
  ON creator_tips FOR SELECT
  TO authenticated
  USING (true);

-- user_feedback table
DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback;
DROP POLICY IF EXISTS "Users can read own feedback" ON user_feedback;

CREATE POLICY "Users can view own feedback"
  ON user_feedback FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

/*
  # Fix Multiple Permissive Policies

  1. Security Enhancement
    - Combine multiple SELECT policies into single policies with OR conditions
    - Improves query planning and performance
    - Maintains same access control logic

  2. Tables Updated
    - conversation_projects
    - conversation_segments
    - creator_tips
    - user_feedback
*/

-- conversation_projects: Combine two SELECT policies into one
DROP POLICY IF EXISTS "Users can manage own conversation projects" ON conversation_projects;
DROP POLICY IF EXISTS "Users can view public conversation projects" ON conversation_projects;

-- Create combined SELECT policy
CREATE POLICY "Users can view own or public conversation projects"
  ON conversation_projects FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR is_public = true);

-- Keep other operations separate
CREATE POLICY "Users can manage own conversation projects"
  ON conversation_projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own conversation projects"
  ON conversation_projects FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own conversation projects"
  ON conversation_projects FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- conversation_segments: Combine two SELECT policies into one
DROP POLICY IF EXISTS "Users can manage own conversation segments" ON conversation_segments;
DROP POLICY IF EXISTS "Users can view public conversation segments" ON conversation_segments;

-- Create combined SELECT policy
CREATE POLICY "Users can view own or public conversation segments"
  ON conversation_segments FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (SELECT id FROM conversation_projects WHERE user_id = (select auth.uid()))
    OR
    conversation_id IN (SELECT id FROM conversation_projects WHERE is_public = true)
  );

-- Keep other operations separate
CREATE POLICY "Users can manage own conversation segments"
  ON conversation_segments FOR INSERT
  TO authenticated
  WITH CHECK (conversation_id IN (
    SELECT id FROM conversation_projects WHERE user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update own conversation segments"
  ON conversation_segments FOR UPDATE
  TO authenticated
  USING (conversation_id IN (
    SELECT id FROM conversation_projects WHERE user_id = (select auth.uid())
  ))
  WITH CHECK (conversation_id IN (
    SELECT id FROM conversation_projects WHERE user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete own conversation segments"
  ON conversation_segments FOR DELETE
  TO authenticated
  USING (conversation_id IN (
    SELECT id FROM conversation_projects WHERE user_id = (select auth.uid())
  ));

-- creator_tips: Combine two SELECT policies into one
DROP POLICY IF EXISTS "Creators can view received tips" ON creator_tips;
DROP POLICY IF EXISTS "Tippers can view own tips" ON creator_tips;

CREATE POLICY "Users can view tips as creator or tipper"
  ON creator_tips FOR SELECT
  TO authenticated
  USING (creator_id = (select auth.uid()) OR tipper_id = (select auth.uid()));

-- user_feedback: Combine two SELECT policies into one
DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback;
DROP POLICY IF EXISTS "Users can view public feature requests" ON user_feedback;

CREATE POLICY "Users can view own or public feedback"
  ON user_feedback FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR (type = 'feature_request' AND is_public = true));
/*
  # Optimize RLS Policies - Part 4

  1. Performance Optimization
    - Continue replacing auth.uid() with (select auth.uid())

  2. Tables Updated
    - conversation_templates
    - story_interactions
    - learning_vocabulary
    - learning_progress
    - quiz_results
    - user_achievements
*/

-- conversation_templates
DROP POLICY IF EXISTS "Users can view own templates" ON conversation_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON conversation_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON conversation_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON conversation_templates;

CREATE POLICY "Users can view own templates"
  ON conversation_templates FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR is_public = true);

CREATE POLICY "Users can insert own templates"
  ON conversation_templates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own templates"
  ON conversation_templates FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own templates"
  ON conversation_templates FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- story_interactions
DROP POLICY IF EXISTS "Users can view own interactions" ON story_interactions;
DROP POLICY IF EXISTS "Users can insert own interactions" ON story_interactions;
DROP POLICY IF EXISTS "Users can delete own interactions" ON story_interactions;

CREATE POLICY "Users can view own interactions"
  ON story_interactions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own interactions"
  ON story_interactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own interactions"
  ON story_interactions FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- learning_vocabulary
DROP POLICY IF EXISTS "Users can manage own vocabulary" ON learning_vocabulary;
CREATE POLICY "Users can manage own vocabulary"
  ON learning_vocabulary FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- learning_progress
DROP POLICY IF EXISTS "Users can manage own learning progress" ON learning_progress;
CREATE POLICY "Users can manage own learning progress"
  ON learning_progress FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- quiz_results
DROP POLICY IF EXISTS "Users can view own quiz results" ON quiz_results;
DROP POLICY IF EXISTS "Users can insert own quiz results" ON quiz_results;

CREATE POLICY "Users can view own quiz results"
  ON quiz_results FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- user_achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
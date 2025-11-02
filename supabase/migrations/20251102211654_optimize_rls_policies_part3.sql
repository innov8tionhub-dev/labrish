/*
  # Optimize RLS Policies - Part 3

  1. Performance Optimization
    - Continue replacing auth.uid() with (select auth.uid())

  2. Tables Updated
    - creator_profiles
    - user_preferences
    - creator_tips
    - ai_assist_usage
    - community_prompts
*/

-- creator_profiles
DROP POLICY IF EXISTS "Users can create own profile" ON creator_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON creator_profiles;

CREATE POLICY "Users can create own profile"
  ON creator_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON creator_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- user_preferences
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- creator_tips
DROP POLICY IF EXISTS "Creators can view received tips" ON creator_tips;
DROP POLICY IF EXISTS "Tippers can view own tips" ON creator_tips;
DROP POLICY IF EXISTS "Users can create tips" ON creator_tips;

CREATE POLICY "Creators can view received tips"
  ON creator_tips FOR SELECT
  TO authenticated
  USING (creator_id = (select auth.uid()));

CREATE POLICY "Tippers can view own tips"
  ON creator_tips FOR SELECT
  TO authenticated
  USING (tipper_id = (select auth.uid()));

CREATE POLICY "Users can create tips"
  ON creator_tips FOR INSERT
  TO authenticated
  WITH CHECK (tipper_id = (select auth.uid()));

-- ai_assist_usage
DROP POLICY IF EXISTS "Users can view own AI assist usage" ON ai_assist_usage;
DROP POLICY IF EXISTS "Users can insert own AI assist usage" ON ai_assist_usage;

CREATE POLICY "Users can view own AI assist usage"
  ON ai_assist_usage FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own AI assist usage"
  ON ai_assist_usage FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- community_prompts
DROP POLICY IF EXISTS "Users can insert own prompts" ON community_prompts;
DROP POLICY IF EXISTS "Users can update own prompts" ON community_prompts;

CREATE POLICY "Users can insert own prompts"
  ON community_prompts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own prompts"
  ON community_prompts FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
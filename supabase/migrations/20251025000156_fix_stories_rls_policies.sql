/*
  # Fix Stories RLS Policies
  
  This migration fixes the stories table RLS policies to use separate policies
  for each operation (SELECT, INSERT, UPDATE, DELETE) instead of a single ALL policy.
  
  This follows security best practices and provides clearer policy definitions.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own stories" ON stories;
DROP POLICY IF EXISTS "Public stories are readable" ON stories;
DROP POLICY IF EXISTS "Users can access stories" ON stories;
DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;

-- Create separate policies for better clarity and security
CREATE POLICY "Users can view stories"
  ON stories
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR is_public = true);

CREATE POLICY "Users can insert own stories"
  ON stories
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own stories"
  ON stories
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own stories"
  ON stories
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

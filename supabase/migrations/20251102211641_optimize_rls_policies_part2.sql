/*
  # Optimize RLS Policies - Part 2

  1. Performance Optimization
    - Continue replacing auth.uid() with (select auth.uid())

  2. Tables Updated
    - offline_cache_manifest
    - offline_sync_queue
    - conversation_projects
    - conversation_segments
    - conversation_characters
    - batch_generation_jobs
    - batch_generation_items
*/

-- offline_cache_manifest
DROP POLICY IF EXISTS "Users can manage own cache" ON offline_cache_manifest;
CREATE POLICY "Users can manage own cache"
  ON offline_cache_manifest FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- offline_sync_queue
DROP POLICY IF EXISTS "Users can manage own sync queue" ON offline_sync_queue;
CREATE POLICY "Users can manage own sync queue"
  ON offline_sync_queue FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- conversation_projects
DROP POLICY IF EXISTS "Users can manage own conversation projects" ON conversation_projects;
CREATE POLICY "Users can manage own conversation projects"
  ON conversation_projects FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- conversation_segments
DROP POLICY IF EXISTS "Users can manage own conversation segments" ON conversation_segments;
CREATE POLICY "Users can manage own conversation segments"
  ON conversation_segments FOR ALL
  TO authenticated
  USING (conversation_id IN (
    SELECT id FROM conversation_projects WHERE user_id = (select auth.uid())
  ))
  WITH CHECK (conversation_id IN (
    SELECT id FROM conversation_projects WHERE user_id = (select auth.uid())
  ));

-- conversation_characters
DROP POLICY IF EXISTS "Users can manage own characters" ON conversation_characters;
CREATE POLICY "Users can manage own characters"
  ON conversation_characters FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- batch_generation_jobs
DROP POLICY IF EXISTS "Users can manage own batch jobs" ON batch_generation_jobs;
CREATE POLICY "Users can manage own batch jobs"
  ON batch_generation_jobs FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- batch_generation_items
DROP POLICY IF EXISTS "Users can manage own batch items" ON batch_generation_items;
CREATE POLICY "Users can manage own batch items"
  ON batch_generation_items FOR ALL
  TO authenticated
  USING (job_id IN (
    SELECT id FROM batch_generation_jobs WHERE user_id = (select auth.uid())
  ))
  WITH CHECK (job_id IN (
    SELECT id FROM batch_generation_jobs WHERE user_id = (select auth.uid())
  ));
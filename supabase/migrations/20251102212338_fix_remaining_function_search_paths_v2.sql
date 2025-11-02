/*
  # Fix Remaining Function Search Paths

  1. Changes
    - Add search_path = '' to increment_conversation_play_count function
    - Add search_path = '' to log_user_activity function
    - Add search_path = '' to update_batch_job_progress function
    - Add search_path = '' to update_cache_last_accessed function

  2. Security
    - Hardens SECURITY DEFINER functions against search_path exploitation
    - Uses fully qualified schema names (public.table_name)
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS public.increment_conversation_play_count(uuid);
DROP FUNCTION IF EXISTS public.log_user_activity(uuid, activity_type, text, uuid, jsonb);
DROP FUNCTION IF EXISTS public.update_batch_job_progress(uuid);
DROP FUNCTION IF EXISTS public.update_cache_last_accessed(uuid);

-- increment_conversation_play_count function
CREATE FUNCTION public.increment_conversation_play_count(project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.conversation_projects
  SET play_count = COALESCE(play_count, 0) + 1
  WHERE id = project_id;
END;
$$;

-- log_user_activity function
CREATE FUNCTION public.log_user_activity(
  p_user_id uuid,
  p_activity_type public.activity_type,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_activities (user_id, activity_type, entity_type, entity_id, metadata)
  VALUES (p_user_id, p_activity_type, p_entity_type, p_entity_id, p_metadata);
END;
$$;

-- update_batch_job_progress function
CREATE FUNCTION public.update_batch_job_progress(p_job_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_total_items integer;
  v_completed_items integer;
  v_failed_items integer;
  v_progress integer;
  v_all_completed boolean;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'failed')
  INTO v_total_items, v_completed_items, v_failed_items
  FROM public.batch_generation_items
  WHERE job_id = p_job_id;

  IF v_total_items > 0 THEN
    v_progress := ROUND((v_completed_items + v_failed_items)::numeric / v_total_items * 100);
  ELSE
    v_progress := 0;
  END IF;

  v_all_completed := (v_completed_items + v_failed_items) = v_total_items;

  UPDATE public.batch_generation_jobs
  SET 
    progress = v_progress,
    completed_items = v_completed_items,
    failed_items = v_failed_items,
    status = CASE 
      WHEN v_all_completed AND v_failed_items = 0 THEN 'completed'
      WHEN v_all_completed AND v_failed_items > 0 THEN 'completed_with_errors'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_job_id;
END;
$$;

-- update_cache_last_accessed function
CREATE FUNCTION public.update_cache_last_accessed(cache_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.offline_cache
  SET 
    last_accessed = NOW(),
    access_count = COALESCE(access_count, 0) + 1
  WHERE id = cache_id;
END;
$$;

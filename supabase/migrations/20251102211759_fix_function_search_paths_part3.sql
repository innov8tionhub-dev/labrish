/*
  # Fix Function Search Paths - Part 3

  1. Continue fixing search paths for batch job functions
*/

-- Fix update_batch_job_progress
CREATE OR REPLACE FUNCTION update_batch_job_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job record;
BEGIN
  FOR job IN SELECT id FROM batch_generation_jobs WHERE status = 'processing'
  LOOP
    UPDATE batch_generation_jobs
    SET
      completed_count = (
        SELECT COUNT(*)
        FROM batch_generation_items
        WHERE job_id = job.id AND status = 'completed'
      ),
      failed_count = (
        SELECT COUNT(*)
        FROM batch_generation_items
        WHERE job_id = job.id AND status = 'failed'
      )
    WHERE id = job.id;
  END LOOP;
END;
$$;

-- Fix update_batch_job_updated_at
CREATE OR REPLACE FUNCTION update_batch_job_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix trigger_batch_job_progress_update
CREATE OR REPLACE FUNCTION trigger_batch_job_progress_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE batch_generation_jobs
  SET
    completed_count = (
      SELECT COUNT(*)
      FROM batch_generation_items
      WHERE job_id = NEW.job_id AND status = 'completed'
    ),
    failed_count = (
      SELECT COUNT(*)
      FROM batch_generation_items
      WHERE job_id = NEW.job_id AND status = 'failed'
    ),
    updated_at = now()
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$;

-- Fix update_creator_profile_updated_at
CREATE OR REPLACE FUNCTION update_creator_profile_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_user_preferences_updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_creator_tip_totals
CREATE OR REPLACE FUNCTION update_creator_tip_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.payment_status = 'completed' THEN
    UPDATE creator_profiles
    SET
      total_tips_received = total_tips_received + NEW.amount,
      tip_count = tip_count + 1
    WHERE user_id = NEW.creator_id;
  END IF;
  RETURN NEW;
END;
$$;
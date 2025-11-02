/*
  # Fix Function Search Paths - Part 2

  1. Continue fixing search paths for remaining functions
*/

-- Fix update_cache_last_accessed
CREATE OR REPLACE FUNCTION update_cache_last_accessed()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.last_accessed_at = now();
  RETURN NEW;
END;
$$;

-- Fix cleanup_expired_cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM offline_cache_manifest
  WHERE expires_at < now();
END;
$$;

-- Fix update_offline_cache_updated_at
CREATE OR REPLACE FUNCTION update_offline_cache_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_conversation_updated_at
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix increment_conversation_play_count
CREATE OR REPLACE FUNCTION increment_conversation_play_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE conversation_projects
  SET play_count = play_count + 1
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Fix log_user_activity
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_activities (user_id, activity_type, entity_type, entity_id)
  VALUES (NEW.user_id, TG_ARGV[0], TG_TABLE_NAME, NEW.id);
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
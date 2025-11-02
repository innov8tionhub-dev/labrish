/*
  # Fix Function Search Paths

  1. Security Enhancement
    - Add IMMUTABLE search_path to all functions
    - Prevents search path manipulation attacks
    - Sets explicit schema references

  2. Functions Updated
    - All trigger and utility functions
*/

-- Fix increment_story_counter
CREATE OR REPLACE FUNCTION increment_story_counter(
  p_story_id uuid,
  p_counter_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO story_analytics (story_id, view_count, play_count, share_count, like_count, bookmark_count)
  VALUES (
    p_story_id,
    CASE WHEN p_counter_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN p_counter_type = 'play' THEN 1 ELSE 0 END,
    CASE WHEN p_counter_type = 'share' THEN 1 ELSE 0 END,
    CASE WHEN p_counter_type = 'like' THEN 1 ELSE 0 END,
    CASE WHEN p_counter_type = 'bookmark' THEN 1 ELSE 0 END
  )
  ON CONFLICT (story_id) DO UPDATE SET
    view_count = story_analytics.view_count + CASE WHEN p_counter_type = 'view' THEN 1 ELSE 0 END,
    play_count = story_analytics.play_count + CASE WHEN p_counter_type = 'play' THEN 1 ELSE 0 END,
    share_count = story_analytics.share_count + CASE WHEN p_counter_type = 'share' THEN 1 ELSE 0 END,
    like_count = story_analytics.like_count + CASE WHEN p_counter_type = 'like' THEN 1 ELSE 0 END,
    bookmark_count = story_analytics.bookmark_count + CASE WHEN p_counter_type = 'bookmark' THEN 1 ELSE 0 END,
    last_viewed_at = CASE WHEN p_counter_type IN ('view', 'play') THEN now() ELSE story_analytics.last_viewed_at END,
    updated_at = now();
END;
$$;

-- Fix calculate_next_review
CREATE OR REPLACE FUNCTION calculate_next_review(
  p_mastery_level integer
)
RETURNS timestamptz
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN CASE p_mastery_level
    WHEN 0 THEN now() + interval '1 day'
    WHEN 1 THEN now() + interval '3 days'
    WHEN 2 THEN now() + interval '7 days'
    WHEN 3 THEN now() + interval '14 days'
    WHEN 4 THEN now() + interval '30 days'
    WHEN 5 THEN now() + interval '90 days'
    ELSE now() + interval '1 day'
  END;
END;
$$;

-- Fix update_vocabulary_next_review
CREATE OR REPLACE FUNCTION update_vocabulary_next_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.next_review_at := calculate_next_review(NEW.mastery_level);
  RETURN NEW;
END;
$$;

-- Fix update_feedback_vote_count
CREATE OR REPLACE FUNCTION update_feedback_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_feedback
    SET votes = votes + 1
    WHERE id = NEW.feedback_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_feedback
    SET votes = votes - 1
    WHERE id = OLD.feedback_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix update_user_feedback_updated_at
CREATE OR REPLACE FUNCTION update_user_feedback_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
/*
  # Add missing indexes and fix race conditions in play count functions

  1. New Indexes
    - `stripe_subscriptions` on `subscription_id` for webhook lookups
    - `stripe_subscriptions` on `price_id` for plan filtering
    - `stripe_orders` on `payment_intent_id` for webhook lookups
    - `stripe_orders` on `checkout_session_id` for session resolution
    - `stories` partial index on `created_at DESC` where `is_public = true` for discovery queries
    - `user_activities` composite index on `(user_id, activity_type, created_at)` for filtered queries
    - `audio_files` on `file_path` for uniqueness checks

  2. Function Fixes
    - Drop and recreate `increment_play_count` with atomic SQL increment to prevent race conditions
    - Drop and recreate `increment_conversation_play_count` with atomic SQL increment

  3. Important Notes
    - All indexes use IF NOT EXISTS for safe re-runs
    - Play count functions now use atomic `play_count + 1` instead of read-then-write pattern
*/

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subscription_id
  ON stripe_subscriptions(subscription_id);

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_price_id
  ON stripe_subscriptions(price_id);

CREATE INDEX IF NOT EXISTS idx_stripe_orders_payment_intent_id
  ON stripe_orders(payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_stripe_orders_checkout_session_id
  ON stripe_orders(checkout_session_id);

CREATE INDEX IF NOT EXISTS idx_stories_public_discovery
  ON stories(created_at DESC)
  WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_activities_user_type_created
  ON user_activities(user_id, activity_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audio_files_file_path
  ON audio_files(file_path);

DROP FUNCTION IF EXISTS public.increment_play_count(uuid);

CREATE FUNCTION public.increment_play_count(story_id_param uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE stories
  SET play_count = play_count + 1,
      updated_at = now()
  WHERE id = story_id_param;
$$;

DROP FUNCTION IF EXISTS public.increment_conversation_play_count(uuid);

CREATE FUNCTION public.increment_conversation_play_count(conversation_id_param uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE conversation_projects
  SET play_count = play_count + 1,
      updated_at = now()
  WHERE id = conversation_id_param;
$$;

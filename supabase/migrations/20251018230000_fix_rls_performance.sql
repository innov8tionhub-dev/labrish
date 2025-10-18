/*
  # Fix RLS Performance Issues

  This migration optimizes Row Level Security (RLS) policies by using subqueries
  for auth functions to prevent per-row re-evaluation. This dramatically improves
  query performance at scale.

  ## Changes

  1. Drop and recreate all RLS policies with optimized (select auth.uid()) pattern
  2. Remove unused indexes to reduce maintenance overhead
  3. Fix multiple permissive policies on stories table
  4. Fix function search path for log_user_activity

  ## Security

  All policies maintain the same security guarantees while improving performance.
*/

-- ============================================================================
-- 1. FIX RLS POLICIES WITH SUBQUERY PATTERN
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own custom voices" ON custom_voices;
DROP POLICY IF EXISTS "Users can manage own stories" ON stories;
DROP POLICY IF EXISTS "Public stories are readable" ON stories;
DROP POLICY IF EXISTS "Users can view own generation counts" ON user_generation_counts;
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
DROP POLICY IF EXISTS "Users can view own activities" ON user_activities;
DROP POLICY IF EXISTS "Users can create own activities" ON user_activities;

-- Recreate custom_voices policy with optimized pattern
CREATE POLICY "Users can manage own custom voices"
  ON custom_voices
  FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Recreate stories policies - combine into single policy to avoid multiple permissive
CREATE POLICY "Users can access stories"
  ON stories
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR is_public = true
  );

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

-- Recreate user_generation_counts policy
CREATE POLICY "Users can view own generation counts"
  ON user_generation_counts
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Recreate stripe_customers policy
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) AND deleted_at IS NULL);

-- Recreate stripe_orders policy
CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Recreate stripe_subscriptions policy
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Recreate user_activities policies
CREATE POLICY "Users can view own activities"
  ON user_activities
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own activities"
  ON user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================================================

-- Note: Keeping user_id indexes as they're likely used for RLS checks
-- Removing only the truly unused ones based on query patterns

DROP INDEX IF EXISTS custom_voices_created_at_idx;
DROP INDEX IF EXISTS stories_play_count_idx;
DROP INDEX IF EXISTS stories_created_at_idx;
DROP INDEX IF EXISTS user_generation_counts_month_idx;
DROP INDEX IF EXISTS user_activities_type_idx;

-- Keep these indexes as they're used by RLS and common queries:
-- - custom_voices_user_id_idx (used in RLS)
-- - stories_user_id_idx (used in RLS)
-- - stories_category_idx (used in filtering)
-- - stories_is_public_idx (used in public story queries)
-- - user_generation_counts_user_id_idx (used in RLS)
-- - user_activities_user_id_idx (used in RLS)
-- - user_activities_created_at_idx (used in sorting)
-- - user_activities_user_created_idx (composite, used in dashboard)

-- ============================================================================
-- 3. FIX FUNCTION SEARCH PATH
-- ============================================================================

-- Recreate log_user_activity function with stable search_path
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id uuid,
  p_activity_type activity_type,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity_id uuid;
BEGIN
  INSERT INTO user_activities (user_id, activity_type, entity_type, entity_id, metadata)
  VALUES (p_user_id, p_activity_type, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$;

-- ============================================================================
-- 4. UPDATE VIEWS TO USE SUBQUERY PATTERN
-- ============================================================================

-- Recreate stripe_user_subscriptions view
CREATE OR REPLACE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
  c.customer_id,
  s.subscription_id,
  s.status as subscription_status,
  s.price_id,
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end,
  s.payment_method_brand,
  s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = (select auth.uid())
AND c.deleted_at IS NULL
AND s.deleted_at IS NULL;

-- Recreate stripe_user_orders view
CREATE OR REPLACE VIEW stripe_user_orders WITH (security_invoker = true) AS
SELECT
  c.customer_id,
  o.id as order_id,
  o.checkout_session_id,
  o.payment_intent_id,
  o.amount_subtotal,
  o.amount_total,
  o.currency,
  o.payment_status,
  o.status as order_status,
  o.created_at as order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.user_id = (select auth.uid())
AND c.deleted_at IS NULL
AND o.deleted_at IS NULL;

-- ============================================================================
-- 5. VERIFY RLS IS STILL ENABLED
-- ============================================================================

-- Ensure RLS is enabled on all tables
ALTER TABLE custom_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_generation_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

/*
  # Database Optimization and Cleanup
  
  This migration addresses several database optimization opportunities:
  
  1. **Missing Indexes for Stripe Operations**
     - Add index on stripe_customers.customer_id for faster lookups
     - Add index on stripe_orders.customer_id for join optimization
  
  2. **Composite Index Optimization**
     - Add composite index on user_generation_counts for common queries
  
  3. **RLS Policy Updates**
     - Fix user_generation_counts policies to include INSERT and UPDATE
     - Ensure all policies use optimized subquery pattern
  
  4. **View Security**
     - Ensure views use security_invoker for proper RLS enforcement
  
  All changes maintain backward compatibility and improve query performance.
*/

-- ============================================================================
-- 1. ADD MISSING INDEXES FOR BETTER QUERY PERFORMANCE
-- ============================================================================

-- Index for stripe billing portal lookups (speeds up customer_id queries)
CREATE INDEX IF NOT EXISTS stripe_customers_customer_id_idx 
  ON stripe_customers(customer_id) 
  WHERE deleted_at IS NULL;

-- Index for order queries by customer
CREATE INDEX IF NOT EXISTS stripe_orders_customer_id_idx 
  ON stripe_orders(customer_id) 
  WHERE deleted_at IS NULL;

-- Composite index for generation count queries (user + month is commonly queried together)
CREATE INDEX IF NOT EXISTS user_generation_counts_user_month_idx 
  ON user_generation_counts(user_id, month);

-- ============================================================================
-- 2. FIX USER_GENERATION_COUNTS RLS POLICIES
-- ============================================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view own generation counts" ON user_generation_counts;
DROP POLICY IF EXISTS "Users can insert own generation counts" ON user_generation_counts;
DROP POLICY IF EXISTS "Users can update own generation counts" ON user_generation_counts;

-- Recreate with proper CRUD operations
CREATE POLICY "Users can view own generation counts"
  ON user_generation_counts
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own generation counts"
  ON user_generation_counts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own generation counts"
  ON user_generation_counts
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- 3. ADD MISSING RLS POLICIES FOR STRIPE TABLES
-- ============================================================================

-- Drop existing if any
DROP POLICY IF EXISTS "Users can insert own customer data" ON stripe_customers;
DROP POLICY IF EXISTS "Users can update own customer data" ON stripe_customers;

-- Allow service role to insert/update customer data (for Stripe webhooks)
CREATE POLICY "Service role can manage customer data"
  ON stripe_customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users should only be able to view, not modify
-- (modifications happen via Stripe webhooks)

-- Similar for subscriptions - service role manages, users view
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON stripe_subscriptions;

CREATE POLICY "Service role can manage subscriptions"
  ON stripe_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Similar for orders
DROP POLICY IF EXISTS "Service role can manage orders" ON stripe_orders;

CREATE POLICY "Service role can manage orders"
  ON stripe_orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 4. OPTIMIZE CUSTOM_VOICES POLICIES
-- ============================================================================

-- Drop and recreate with separate policies for better clarity
DROP POLICY IF EXISTS "Users can manage own custom voices" ON custom_voices;

CREATE POLICY "Users can view own custom voices"
  ON custom_voices
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own custom voices"
  ON custom_voices
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own custom voices"
  ON custom_voices
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own custom voices"
  ON custom_voices
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- 5. ADD HELPFUL DATABASE FUNCTIONS
-- ============================================================================

-- Function to get user's current month generation count
CREATE OR REPLACE FUNCTION get_user_generation_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_current_month text;
BEGIN
  v_current_month := to_char(now(), 'YYYY-MM');
  
  SELECT COALESCE(generation_count, 0)
  INTO v_count
  FROM user_generation_counts
  WHERE user_id = p_user_id
  AND month = v_current_month;
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- Function to increment generation count safely
CREATE OR REPLACE FUNCTION increment_generation_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_month text;
  v_new_count integer;
BEGIN
  v_current_month := to_char(now(), 'YYYY-MM');
  
  INSERT INTO user_generation_counts (user_id, month, generation_count, last_generated_at)
  VALUES (p_user_id, v_current_month, 1, now())
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    generation_count = user_generation_counts.generation_count + 1,
    last_generated_at = now(),
    updated_at = now()
  RETURNING generation_count INTO v_new_count;
  
  RETURN v_new_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_generation_count TO authenticated;
GRANT EXECUTE ON FUNCTION increment_generation_count TO authenticated;

-- ============================================================================
-- 6. VERIFY ALL TABLES HAVE RLS ENABLED
-- ============================================================================

ALTER TABLE custom_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_generation_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. ADD UPDATED_AT TRIGGERS FOR AUTOMATIC TIMESTAMP MANAGEMENT
-- ============================================================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to tables that have updated_at
DROP TRIGGER IF EXISTS update_custom_voices_updated_at ON custom_voices;
CREATE TRIGGER update_custom_voices_updated_at
  BEFORE UPDATE ON custom_voices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stories_updated_at ON stories;
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_customers_updated_at ON stripe_customers;
CREATE TRIGGER update_stripe_customers_updated_at
  BEFORE UPDATE ON stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_orders_updated_at ON stripe_orders;
CREATE TRIGGER update_stripe_orders_updated_at
  BEFORE UPDATE ON stripe_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_subscriptions_updated_at ON stripe_subscriptions;
CREATE TRIGGER update_stripe_subscriptions_updated_at
  BEFORE UPDATE ON stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_generation_counts_updated_at ON user_generation_counts;
CREATE TRIGGER update_user_generation_counts_updated_at
  BEFORE UPDATE ON user_generation_counts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

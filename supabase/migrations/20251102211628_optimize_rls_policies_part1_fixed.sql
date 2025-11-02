/*
  # Optimize RLS Policies - Part 1 (Fixed)

  1. Performance Optimization
    - Replace auth.uid() with (select auth.uid()) in RLS policies
    - Prevents re-evaluation of auth function for each row
    - Significantly improves query performance at scale

  2. Tables Updated
    - stripe_customers
    - stripe_orders
    - stripe_subscriptions
    - user_activities
    - user_feedback
    - feedback_votes
*/

-- stripe_customers
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- stripe_orders
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
CREATE POLICY "Users can view their own order data"
  ON stripe_orders FOR SELECT
  TO authenticated
  USING (customer_id IN (
    SELECT customer_id FROM stripe_customers WHERE user_id = (select auth.uid())
  ));

-- stripe_subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (customer_id IN (
    SELECT customer_id FROM stripe_customers WHERE user_id = (select auth.uid())
  ));

-- user_activities
DROP POLICY IF EXISTS "Users can view own activities" ON user_activities;
DROP POLICY IF EXISTS "Users can create own activities" ON user_activities;

CREATE POLICY "Users can view own activities"
  ON user_activities FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own activities"
  ON user_activities FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- user_feedback (status is enum: new, reviewing, planned, in_progress, completed, dismissed)
DROP POLICY IF EXISTS "Users can create own feedback" ON user_feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback;
DROP POLICY IF EXISTS "Users can update own pending feedback" ON user_feedback;

CREATE POLICY "Users can create own feedback"
  ON user_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view own feedback"
  ON user_feedback FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own pending feedback"
  ON user_feedback FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()) AND status = 'new')
  WITH CHECK (user_id = (select auth.uid()));

-- feedback_votes
DROP POLICY IF EXISTS "Users can vote on feature requests" ON feedback_votes;
DROP POLICY IF EXISTS "Users can view own votes" ON feedback_votes;
DROP POLICY IF EXISTS "Users can remove own votes" ON feedback_votes;

CREATE POLICY "Users can vote on feature requests"
  ON feedback_votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view own votes"
  ON feedback_votes FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can remove own votes"
  ON feedback_votes FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));
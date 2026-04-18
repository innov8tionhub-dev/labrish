/*
  # Observability and Notification Tables

  Adds foundational tables for the next wave of improvements:

  1. New Tables
    - `analytics_events`
      - Persists client analytics events currently dropped by `src/lib/analytics.ts`.
      - Columns: id, user_id (nullable for anon), session_id, event_name, properties jsonb, page_url, occurred_at.
    - `user_error_logs`
      - Persists errors currently only logged to the console via `errorHandler`.
      - Columns: id, user_id (nullable), level (error/warning/info), message, stack, context jsonb, user_agent, page_url, created_at.
    - `audit_log`
      - Captures privileged / administrative actions (feedback status changes, role changes, moderation).
      - Columns: id, actor_id, action, entity_type, entity_id, metadata jsonb, created_at.
    - `notification_preferences`
      - Per-user opt-ins for feedback, comment, and batch-job alerts.
      - Columns: id, user_id UNIQUE, feedback_updates bool, comment_replies bool, batch_job_complete bool, product_announcements bool, created_at, updated_at.

  2. Security
    - RLS enabled on every new table.
    - analytics_events: authenticated users may INSERT their own rows; SELECT restricted to own rows.
    - user_error_logs: authenticated users may INSERT their own rows; SELECT restricted to own rows.
    - audit_log: authenticated users may SELECT rows where they are the actor; only service role inserts in practice (no INSERT policy granted).
    - notification_preferences: owner-only CRUD (select/insert/update).

  3. Important Notes
    1. No destructive changes. All statements use IF NOT EXISTS.
    2. Tables intentionally allow nullable user_id on analytics_events and user_error_logs so anonymous/pre-auth telemetry can still be captured when a server-side role writes for the user.
    3. Indexes added on user_id + created_at for query performance.
*/

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL DEFAULT '',
  event_name text NOT NULL DEFAULT '',
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  page_url text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_occurred
  ON analytics_events (user_id, occurred_at DESC);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'analytics_events'
      AND policyname = 'Users insert own analytics events'
  ) THEN
    CREATE POLICY "Users insert own analytics events"
      ON analytics_events FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'analytics_events'
      AND policyname = 'Users read own analytics events'
  ) THEN
    CREATE POLICY "Users read own analytics events"
      ON analytics_events FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  level text NOT NULL DEFAULT 'error' CHECK (level IN ('error', 'warning', 'info')),
  message text NOT NULL DEFAULT '',
  stack text,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_agent text,
  page_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_error_logs_user_created
  ON user_error_logs (user_id, created_at DESC);

ALTER TABLE user_error_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_error_logs'
      AND policyname = 'Users insert own error logs'
  ) THEN
    CREATE POLICY "Users insert own error logs"
      ON user_error_logs FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_error_logs'
      AND policyname = 'Users read own error logs'
  ) THEN
    CREATE POLICY "Users read own error logs"
      ON user_error_logs FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL DEFAULT '',
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_created
  ON audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity
  ON audit_log (entity_type, entity_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audit_log'
      AND policyname = 'Users read own audit entries'
  ) THEN
    CREATE POLICY "Users read own audit entries"
      ON audit_log FOR SELECT
      TO authenticated
      USING (auth.uid() = actor_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_updates boolean NOT NULL DEFAULT true,
  comment_replies boolean NOT NULL DEFAULT true,
  batch_job_complete boolean NOT NULL DEFAULT true,
  product_announcements boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notification_preferences'
      AND policyname = 'Users read own notification prefs'
  ) THEN
    CREATE POLICY "Users read own notification prefs"
      ON notification_preferences FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notification_preferences'
      AND policyname = 'Users insert own notification prefs'
  ) THEN
    CREATE POLICY "Users insert own notification prefs"
      ON notification_preferences FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notification_preferences'
      AND policyname = 'Users update own notification prefs'
  ) THEN
    CREATE POLICY "Users update own notification prefs"
      ON notification_preferences FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

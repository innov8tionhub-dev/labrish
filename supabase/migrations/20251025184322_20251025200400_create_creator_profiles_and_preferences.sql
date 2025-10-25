/*
  # Creator Profiles and User Preferences

  1. New Tables
    - `creator_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `display_name` (text) - Public display name
      - `bio` (text) - Creator biography
      - `avatar_url` (text) - Profile image
      - `cover_image_url` (text) - Profile banner
      - `website_url` (text) - Personal website
      - `social_links` (jsonb) - Social media links
      - `specialties` (text[]) - Content specialties/tags
      - `is_verified` (boolean) - Verified creator badge
      - `allow_tips` (boolean) - Enable tipping
      - `tip_message` (text) - Custom tip message
      - `subscriber_count` (integer) - Number of subscribers
      - `total_plays` (integer) - Total content plays
      - `total_tips_received` (numeric) - Total tip amount
      - `metadata` (jsonb) - Additional profile data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `theme` (text) - light, dark, caribbean_dark, high_contrast
      - `font_size` (text) - small, medium, large, extra_large
      - `reduce_motion` (boolean) - Reduce animations
      - `keyboard_shortcuts_enabled` (boolean) - Enable shortcuts
      - `auto_play` (boolean) - Auto-play content
      - `audio_quality` (text) - low, medium, high
      - `notifications_enabled` (boolean) - Enable notifications
      - `email_notifications` (boolean) - Email notifications
      - `language` (text) - Preferred language
      - `dashboard_layout` (jsonb) - Custom dashboard config
      - `accessibility_settings` (jsonb) - Accessibility preferences
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `creator_tips`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references creator_profiles)
      - `tipper_id` (uuid, references auth.users)
      - `amount` (numeric) - Tip amount
      - `currency` (text) - Currency code
      - `message` (text) - Optional message
      - `story_id` (uuid, references stories) - Related story
      - `payment_status` (text) - pending, completed, failed, refunded
      - `payment_id` (text) - External payment reference
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Creator profiles are publicly readable
    - Users can only update their own profiles and preferences
    - Tips are visible to creator and tipper

  3. Indexes
    - Index on user_id, creator_id
*/

-- Create theme enum
DO $$ BEGIN
  CREATE TYPE user_theme AS ENUM ('light', 'dark', 'caribbean_dark', 'high_contrast');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create font size enum
DO $$ BEGIN
  CREATE TYPE font_size AS ENUM ('small', 'medium', 'large', 'extra_large');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create audio quality enum
DO $$ BEGIN
  CREATE TYPE audio_quality AS ENUM ('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create payment status enum
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create creator_profiles table
CREATE TABLE IF NOT EXISTS creator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text NOT NULL,
  bio text,
  avatar_url text,
  cover_image_url text,
  website_url text,
  social_links jsonb DEFAULT '{}',
  specialties text[] DEFAULT '{}',
  is_verified boolean DEFAULT false,
  allow_tips boolean DEFAULT false,
  tip_message text,
  subscriber_count integer DEFAULT 0,
  total_plays integer DEFAULT 0,
  total_tips_received numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme user_theme DEFAULT 'light',
  font_size font_size DEFAULT 'medium',
  reduce_motion boolean DEFAULT false,
  keyboard_shortcuts_enabled boolean DEFAULT true,
  auto_play boolean DEFAULT false,
  audio_quality audio_quality DEFAULT 'high',
  notifications_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  language text DEFAULT 'en',
  dashboard_layout jsonb DEFAULT '{}',
  accessibility_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create creator_tips table
CREATE TABLE IF NOT EXISTS creator_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES creator_profiles(id) ON DELETE CASCADE NOT NULL,
  tipper_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'USD',
  message text,
  story_id uuid REFERENCES stories(id) ON DELETE SET NULL,
  payment_status payment_status DEFAULT 'pending',
  payment_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_tips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_profiles

-- All authenticated users can view creator profiles
CREATE POLICY "Creator profiles are publicly readable"
  ON creator_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can create their own profile
CREATE POLICY "Users can create own profile"
  ON creator_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON creator_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_preferences

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for creator_tips

-- Creators can view tips they received
CREATE POLICY "Creators can view received tips"
  ON creator_tips
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creator_profiles
      WHERE id = creator_tips.creator_id
      AND user_id = auth.uid()
    )
  );

-- Tippers can view their own tips
CREATE POLICY "Tippers can view own tips"
  ON creator_tips
  FOR SELECT
  TO authenticated
  USING (auth.uid() = tipper_id);

-- Users can create tips
CREATE POLICY "Users can create tips"
  ON creator_tips
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = tipper_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS creator_profiles_user_id_idx ON creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS creator_profiles_is_verified_idx ON creator_profiles(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS creator_profiles_subscriber_count_idx ON creator_profiles(subscriber_count DESC);
CREATE INDEX IF NOT EXISTS creator_profiles_total_plays_idx ON creator_profiles(total_plays DESC);
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS creator_tips_creator_id_idx ON creator_tips(creator_id);
CREATE INDEX IF NOT EXISTS creator_tips_tipper_id_idx ON creator_tips(tipper_id);
CREATE INDEX IF NOT EXISTS creator_tips_story_id_idx ON creator_tips(story_id);
CREATE INDEX IF NOT EXISTS creator_tips_payment_status_idx ON creator_tips(payment_status);
CREATE INDEX IF NOT EXISTS creator_tips_created_at_idx ON creator_tips(created_at DESC);

-- Function to update creator profile updated_at
CREATE OR REPLACE FUNCTION update_creator_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user preferences updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS creator_profiles_updated_at_trigger ON creator_profiles;
CREATE TRIGGER creator_profiles_updated_at_trigger
BEFORE UPDATE ON creator_profiles
FOR EACH ROW
EXECUTE FUNCTION update_creator_profile_updated_at();

DROP TRIGGER IF EXISTS user_preferences_updated_at_trigger ON user_preferences;
CREATE TRIGGER user_preferences_updated_at_trigger
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_user_preferences_updated_at();

-- Function to update creator tip totals
CREATE OR REPLACE FUNCTION update_creator_tip_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.payment_status = 'completed') OR
     (TG_OP = 'UPDATE' AND OLD.payment_status != 'completed' AND NEW.payment_status = 'completed') THEN
    UPDATE creator_profiles
    SET total_tips_received = total_tips_received + NEW.amount
    WHERE id = NEW.creator_id;
  ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status = 'completed' AND NEW.payment_status = 'refunded') THEN
    UPDATE creator_profiles
    SET total_tips_received = total_tips_received - NEW.amount
    WHERE id = NEW.creator_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update tip totals
DROP TRIGGER IF EXISTS creator_tips_update_totals_trigger ON creator_tips;
CREATE TRIGGER creator_tips_update_totals_trigger
AFTER INSERT OR UPDATE ON creator_tips
FOR EACH ROW
EXECUTE FUNCTION update_creator_tip_totals();

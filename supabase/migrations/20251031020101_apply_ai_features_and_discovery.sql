/*
  # AI Features and Discovery System

  1. New Tables
    - `ai_assist_usage`: Tracks GPT-5 API usage per user with tier limits
    - `community_prompts`: User-submitted story prompts with voting system
    - `conversation_templates`: Reusable conversation templates for multi-voice scenarios
    - `story_interactions`: Likes, bookmarks, shares for discovery feed
    - `story_analytics`: View counts and engagement metrics for public stories
    - `learning_vocabulary`: Words learned from stories for language learning
    - `learning_progress`: User learning progress tracking per story
    - `cultural_quizzes`: Generated cultural knowledge quizzes
    - `quiz_results`: User quiz attempt results
    - `user_achievements`: Achievement badges earned by users
    - `daily_challenges`: Daily learning challenges with bonus XP
    - `cultural_knowledge_base`: Cached cultural context for optimization

  2. Security
    - Enable RLS on all tables
    - Implement policies for authenticated users to access their own data
    - Public stories accessible to all users
*/

-- AI Assist Usage Tracking
CREATE TABLE IF NOT EXISTS ai_assist_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assist_type text NOT NULL CHECK (assist_type IN ('generation', 'expansion', 'dialect', 'context', 'prompt', 'polish', 'quiz')),
  model text NOT NULL CHECK (model IN ('gpt-5-mini', 'gpt-5-nano')),
  tokens_used integer NOT NULL DEFAULT 0,
  reasoning_effort text CHECK (reasoning_effort IN ('minimal', 'low', 'medium', 'high')),
  month text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_assist_usage_user_month_idx ON ai_assist_usage(user_id, month);
CREATE INDEX IF NOT EXISTS ai_assist_usage_type_idx ON ai_assist_usage(assist_type);

ALTER TABLE ai_assist_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI assist usage"
  ON ai_assist_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own AI assist usage"
  ON ai_assist_usage FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Community Prompts
CREATE TABLE IF NOT EXISTS community_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_text text NOT NULL,
  category text NOT NULL,
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_prompts_category_idx ON community_prompts(category);
CREATE INDEX IF NOT EXISTS community_prompts_votes_idx ON community_prompts(votes DESC);

ALTER TABLE community_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community prompts"
  ON community_prompts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own prompts"
  ON community_prompts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own prompts"
  ON community_prompts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Conversation Templates
CREATE TABLE IF NOT EXISTS conversation_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  structure jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversation_templates_user_idx ON conversation_templates(user_id);
CREATE INDEX IF NOT EXISTS conversation_templates_public_idx ON conversation_templates(is_public) WHERE is_public = true;

ALTER TABLE conversation_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON conversation_templates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can insert own templates"
  ON conversation_templates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own templates"
  ON conversation_templates FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own templates"
  ON conversation_templates FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Story Interactions
CREATE TABLE IF NOT EXISTS story_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('like', 'bookmark', 'share', 'play', 'view')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, story_id, interaction_type)
);

CREATE INDEX IF NOT EXISTS story_interactions_story_idx ON story_interactions(story_id);
CREATE INDEX IF NOT EXISTS story_interactions_user_idx ON story_interactions(user_id);
CREATE INDEX IF NOT EXISTS story_interactions_type_idx ON story_interactions(interaction_type);

ALTER TABLE story_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions"
  ON story_interactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own interactions"
  ON story_interactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own interactions"
  ON story_interactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Story Analytics
CREATE TABLE IF NOT EXISTS story_analytics (
  story_id uuid PRIMARY KEY REFERENCES stories(id) ON DELETE CASCADE,
  view_count integer DEFAULT 0,
  play_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  bookmark_count integer DEFAULT 0,
  last_viewed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS story_analytics_play_count_idx ON story_analytics(play_count DESC);
CREATE INDEX IF NOT EXISTS story_analytics_view_count_idx ON story_analytics(view_count DESC);

ALTER TABLE story_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view story analytics"
  ON story_analytics FOR SELECT
  TO authenticated
  USING (true);

-- Learning Vocabulary
CREATE TABLE IF NOT EXISTS learning_vocabulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word text NOT NULL,
  definition text,
  example_sentence text,
  story_id uuid REFERENCES stories(id) ON DELETE SET NULL,
  mastery_level integer DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS learning_vocabulary_user_idx ON learning_vocabulary(user_id);
CREATE INDEX IF NOT EXISTS learning_vocabulary_next_review_idx ON learning_vocabulary(next_review_at);

ALTER TABLE learning_vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vocabulary"
  ON learning_vocabulary FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Learning Progress
CREATE TABLE IF NOT EXISTS learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  words_learned integer DEFAULT 0,
  comprehension_score decimal,
  time_spent_seconds integer DEFAULT 0,
  last_accessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, story_id)
);

CREATE INDEX IF NOT EXISTS learning_progress_user_idx ON learning_progress(user_id);

ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own learning progress"
  ON learning_progress FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Cultural Quizzes
CREATE TABLE IF NOT EXISTS cultural_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category text NOT NULL,
  questions jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cultural_quizzes_story_idx ON cultural_quizzes(story_id);
CREATE INDEX IF NOT EXISTS cultural_quizzes_difficulty_idx ON cultural_quizzes(difficulty);

ALTER TABLE cultural_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cultural quizzes"
  ON cultural_quizzes FOR SELECT
  TO authenticated
  USING (true);

-- Quiz Results
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES cultural_quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  xp_earned integer DEFAULT 0,
  time_taken_seconds integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quiz_results_user_idx ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS quiz_results_quiz_idx ON quiz_results(quiz_id);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz results"
  ON quiz_results FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_data jsonb,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

CREATE INDEX IF NOT EXISTS user_achievements_user_idx ON user_achievements(user_id);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Daily Challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date NOT NULL UNIQUE,
  quiz_id uuid REFERENCES cultural_quizzes(id) ON DELETE SET NULL,
  bonus_xp integer DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS daily_challenges_date_idx ON daily_challenges(challenge_date DESC);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Cultural Knowledge Base (for caching)
CREATE TABLE IF NOT EXISTS cultural_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cultural_knowledge_base_term_idx ON cultural_knowledge_base(term);

ALTER TABLE cultural_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cultural knowledge"
  ON cultural_knowledge_base FOR SELECT
  TO authenticated
  USING (true);

-- Function to increment story analytics counters
CREATE OR REPLACE FUNCTION increment_story_counter(
  p_story_id uuid,
  p_counter_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to calculate spaced repetition next review date
CREATE OR REPLACE FUNCTION calculate_next_review(
  p_mastery_level integer
)
RETURNS timestamptz
LANGUAGE plpgsql
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

-- Trigger to update next_review_at when mastery_level changes
CREATE OR REPLACE FUNCTION update_vocabulary_next_review()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.next_review_at := calculate_next_review(NEW.mastery_level);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vocabulary_review_trigger ON learning_vocabulary;

CREATE TRIGGER vocabulary_review_trigger
  BEFORE INSERT OR UPDATE OF mastery_level
  ON learning_vocabulary
  FOR EACH ROW
  EXECUTE FUNCTION update_vocabulary_next_review();
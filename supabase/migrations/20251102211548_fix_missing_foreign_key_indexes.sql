/*
  # Fix Missing Foreign Key Indexes

  1. Performance Improvements
    - Add indexes for all unindexed foreign keys
    - Improves query performance when joining tables
    - Prevents table scans on foreign key lookups

  2. Indexes Added
    - community_prompts.user_id
    - daily_challenges.quiz_id
    - learning_progress.story_id
    - learning_vocabulary.story_id
*/

-- Add index for community_prompts.user_id (already has user_id in queries)
CREATE INDEX IF NOT EXISTS community_prompts_user_id_idx ON community_prompts(user_id);

-- Add index for daily_challenges.quiz_id
CREATE INDEX IF NOT EXISTS daily_challenges_quiz_id_idx ON daily_challenges(quiz_id);

-- Add index for learning_progress.story_id
CREATE INDEX IF NOT EXISTS learning_progress_story_id_idx ON learning_progress(story_id);

-- Add index for learning_vocabulary.story_id
CREATE INDEX IF NOT EXISTS learning_vocabulary_story_id_idx ON learning_vocabulary(story_id);
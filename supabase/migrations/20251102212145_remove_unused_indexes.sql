/*
  # Remove Unused Indexes

  1. Performance Optimization
    - Drop indexes that have never been used
    - Reduces database maintenance overhead
    - Saves storage space and improves write performance
    
  2. Strategy
    - Keep indexes on tables with data (stories, user_generation_counts, user_activities)
    - Remove indexes from unused/new features (custom_voices, batch jobs, conversation features)
    - Keep critical indexes for RLS and foreign keys
*/

-- Remove unused indexes from features not yet implemented
DROP INDEX IF EXISTS custom_voices_created_at_idx;
DROP INDEX IF EXISTS custom_voices_user_id_idx;

-- Remove unused indexes from batch generation (feature not active)
DROP INDEX IF EXISTS batch_jobs_user_id_idx;
DROP INDEX IF EXISTS batch_jobs_status_idx;
DROP INDEX IF EXISTS batch_jobs_created_at_idx;
DROP INDEX IF EXISTS batch_items_job_id_idx;
DROP INDEX IF EXISTS batch_items_sequence_order_idx;
DROP INDEX IF EXISTS batch_items_status_idx;

-- Remove unused indexes from conversation features (not active)
DROP INDEX IF EXISTS conversation_projects_user_id_idx;
DROP INDEX IF EXISTS conversation_projects_category_idx;
DROP INDEX IF EXISTS conversation_projects_status_idx;
DROP INDEX IF EXISTS conversation_projects_is_public_idx;
DROP INDEX IF EXISTS conversation_projects_created_at_idx;
DROP INDEX IF EXISTS conversation_segments_conversation_id_idx;
DROP INDEX IF EXISTS conversation_segments_sequence_order_idx;
DROP INDEX IF EXISTS conversation_characters_user_id_idx;

-- Remove unused indexes from offline features (not heavily used)
DROP INDEX IF EXISTS offline_cache_user_id_idx;
DROP INDEX IF EXISTS offline_cache_story_id_idx;
DROP INDEX IF EXISTS offline_cache_status_idx;
DROP INDEX IF EXISTS offline_cache_expires_at_idx;
DROP INDEX IF EXISTS offline_cache_last_accessed_idx;
DROP INDEX IF EXISTS offline_sync_user_id_idx;
DROP INDEX IF EXISTS offline_sync_status_idx;
DROP INDEX IF EXISTS offline_sync_created_at_idx;

-- Remove unused indexes from creator features (not active)
DROP INDEX IF EXISTS creator_profiles_subscriber_count_idx;
DROP INDEX IF EXISTS creator_profiles_total_plays_idx;
DROP INDEX IF EXISTS creator_profiles_user_id_idx;
DROP INDEX IF EXISTS creator_profiles_is_verified_idx;
DROP INDEX IF EXISTS creator_tips_creator_id_idx;
DROP INDEX IF EXISTS creator_tips_tipper_id_idx;
DROP INDEX IF EXISTS creator_tips_story_id_idx;
DROP INDEX IF EXISTS creator_tips_payment_status_idx;
DROP INDEX IF EXISTS creator_tips_created_at_idx;

-- Remove unused indexes from feedback system (low usage)
DROP INDEX IF EXISTS user_feedback_user_id_idx;
DROP INDEX IF EXISTS user_feedback_type_idx;
DROP INDEX IF EXISTS user_feedback_category_idx;
DROP INDEX IF EXISTS user_feedback_status_idx;
DROP INDEX IF EXISTS user_feedback_created_at_idx;
DROP INDEX IF EXISTS user_feedback_votes_idx;
DROP INDEX IF EXISTS user_feedback_is_public_idx;
DROP INDEX IF EXISTS feedback_votes_feedback_id_idx;
DROP INDEX IF EXISTS feedback_votes_user_id_idx;

-- Remove unused indexes from Stripe tables (low volume)
DROP INDEX IF EXISTS stripe_customers_customer_id_idx;
DROP INDEX IF EXISTS stripe_orders_customer_id_idx;

-- Remove unused indexes from user preferences (single row per user)
DROP INDEX IF EXISTS user_preferences_user_id_idx;

-- Keep core indexes that will be used as platform grows:
-- - stories_* indexes (main feature)
-- - user_generation_counts_* indexes (usage tracking)
-- - user_activities_* indexes (analytics)
-- - community_prompts_* indexes (AI feature)
-- - story_interactions_* indexes (discovery feature)
-- - story_analytics_* indexes (discovery feature)
-- - learning_* indexes (learning feature)
-- - quiz_* indexes (quiz feature)
-- - ai_assist_usage_* indexes (AI tracking)
-- - cultural_quizzes_* indexes (learning content)
-- - daily_challenges_* indexes (gamification)
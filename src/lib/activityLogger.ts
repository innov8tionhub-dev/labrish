import { supabase } from './supabase';

export type ActivityType =
  | 'story_created'
  | 'story_updated'
  | 'story_deleted'
  | 'audio_generated'
  | 'voice_trained'
  | 'voice_created'
  | 'story_shared'
  | 'story_played'
  | 'account_upgraded'
  | 'feature_used';

export interface LogActivityParams {
  activityType: ActivityType;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

export const logActivity = async ({
  activityType,
  entityType,
  entityId,
  metadata = {}
}: LogActivityParams): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('Cannot log activity: User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        entity_type: entityType || null,
        entity_id: entityId || null,
        metadata
      });

    if (error) {
      console.error('Failed to log activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error logging activity:', error);
    return false;
  }
};

export const logAudioGeneration = async (metadata: {
  title?: string;
  voice?: string;
  duration?: number;
  textLength?: number;
}) => {
  return logActivity({
    activityType: 'audio_generated',
    entityType: 'audio',
    metadata
  });
};

export const logStoryCreated = async (storyId: string, metadata: {
  title: string;
  category?: string;
  duration?: number;
}) => {
  return logActivity({
    activityType: 'story_created',
    entityType: 'story',
    entityId: storyId,
    metadata
  });
};

export const logStoryShared = async (storyId: string, metadata: {
  title: string;
  category?: string;
}) => {
  return logActivity({
    activityType: 'story_shared',
    entityType: 'story',
    entityId: storyId,
    metadata
  });
};

export const logStoryPlayed = async (storyId: string, metadata: {
  title: string;
}) => {
  return logActivity({
    activityType: 'story_played',
    entityType: 'story',
    entityId: storyId,
    metadata
  });
};

import { supabase } from './supabase';

export interface Feedback {
  id: string;
  user_id: string;
  type: 'feedback' | 'bug' | 'feature_request' | 'nps_survey';
  category: 'ui_ux' | 'performance' | 'content' | 'voice_quality' | 'pricing' | 'accessibility' | 'mobile' | 'other';
  title: string;
  content: string;
  rating: number | null;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'new' | 'reviewing' | 'planned' | 'in_progress' | 'completed' | 'dismissed';
  admin_response: string | null;
  responded_at: string | null;
  page_url: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  votes: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedbackVote {
  id: string;
  feedback_id: string;
  user_id: string;
  created_at: string;
}

export const submitFeedback = async (feedbackData: Partial<Feedback>): Promise<Feedback> => {
  const { data, error } = await supabase
    .from('user_feedback')
    .insert([feedbackData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserFeedback = async (limit = 50): Promise<Feedback[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_feedback')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const getPublicFeatureRequests = async (limit = 50): Promise<Feedback[]> => {
  const { data, error } = await supabase
    .from('user_feedback')
    .select('*')
    .eq('type', 'feature_request')
    .eq('is_public', true)
    .order('votes', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const voteFeedback = async (feedbackId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error: voteError } = await supabase
    .from('feedback_votes')
    .insert([{ feedback_id: feedbackId, user_id: user.id }]);

  if (voteError) {
    if (voteError.code === '23505') {
      throw new Error('You have already voted on this feedback');
    }
    throw voteError;
  }
};

export const unvoteFeedback = async (feedbackId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('feedback_votes')
    .delete()
    .eq('feedback_id', feedbackId)
    .eq('user_id', user.id);

  if (error) throw error;
};

export const getUserVotes = async (): Promise<string[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('feedback_votes')
    .select('feedback_id')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching user votes:', error);
    return [];
  }

  return (data || []).map(vote => vote.feedback_id);
};

export const getFeedbackById = async (feedbackId: string): Promise<Feedback | null> => {
  const { data, error } = await supabase
    .from('user_feedback')
    .select('*')
    .eq('id', feedbackId)
    .single();

  if (error) {
    console.error('Error fetching feedback:', error);
    return null;
  }

  return data;
};

export const updateFeedback = async (
  feedbackId: string,
  updates: Partial<Feedback>
): Promise<Feedback> => {
  const { data, error } = await supabase
    .from('user_feedback')
    .update(updates)
    .eq('id', feedbackId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteFeedback = async (feedbackId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_feedback')
    .delete()
    .eq('id', feedbackId);

  if (error) throw error;
};

export const getFeedbackStats = async (): Promise<{
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  averageRating: number;
}> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_feedback')
    .select('type, status, rating')
    .eq('user_id', user.id);

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    byType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    averageRating: 0
  };

  if (data) {
    let totalRating = 0;
    let ratingCount = 0;

    data.forEach(item => {
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;

      if (item.rating) {
        totalRating += item.rating;
        ratingCount++;
      }
    });

    stats.averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
  }

  return stats;
};

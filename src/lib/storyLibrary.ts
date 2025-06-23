import { supabase } from './supabase';

export interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  voice_id: string;
  voice_settings: any;
  audio_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_public: boolean;
  play_count: number;
  duration?: number;
}

export interface StoryCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export const STORY_CATEGORIES: StoryCategory[] = [
  { id: 'folklore', name: 'Caribbean Folklore', description: 'Traditional stories and legends', color: 'from-amber-500 to-orange-500' },
  { id: 'adventure', name: 'Adventure', description: 'Exciting tales of exploration', color: 'from-blue-500 to-cyan-500' },
  { id: 'romance', name: 'Romance', description: 'Love stories and relationships', color: 'from-pink-500 to-rose-500' },
  { id: 'mystery', name: 'Mystery', description: 'Suspenseful and intriguing tales', color: 'from-purple-500 to-indigo-500' },
  { id: 'comedy', name: 'Comedy', description: 'Humorous and lighthearted stories', color: 'from-green-500 to-emerald-500' },
  { id: 'educational', name: 'Educational', description: 'Learning through storytelling', color: 'from-teal-500 to-cyan-500' },
  { id: 'personal', name: 'Personal', description: 'Personal experiences and memoirs', color: 'from-gray-500 to-slate-500' },
];

/**
 * Save a story to the user's library
 */
export const saveStory = async (story: Omit<Story, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'play_count'>): Promise<Story> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('stories')
    .insert({
      ...story,
      user_id: user.id,
      play_count: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save story: ${error.message}`);
  }

  return data;
};

/**
 * Get user's stories
 */
export const getUserStories = async (category?: string): Promise<Story[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('stories')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch stories: ${error.message}`);
  }

  return data || [];
};

/**
 * Get public stories
 */
export const getPublicStories = async (category?: string, limit = 20): Promise<Story[]> => {
  let query = supabase
    .from('stories')
    .select('*')
    .eq('is_public', true)
    .order('play_count', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch public stories: ${error.message}`);
  }

  return data || [];
};

/**
 * Update a story
 */
export const updateStory = async (id: string, updates: Partial<Story>): Promise<Story> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('stories')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update story: ${error.message}`);
  }

  return data;
};

/**
 * Delete a story
 */
export const deleteStory = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete story: ${error.message}`);
  }
};

/**
 * Increment play count
 */
export const incrementPlayCount = async (id: string): Promise<void> => {
  const { error } = await supabase.rpc('increment_play_count', { story_id: id });

  if (error) {
    console.error('Failed to increment play count:', error);
  }
};

/**
 * Search stories
 */
export const searchStories = async (query: string, category?: string): Promise<Story[]> => {
  let supabaseQuery = supabase
    .from('stories')
    .select('*')
    .or(`title.ilike.%${query}%, content.ilike.%${query}%, tags.cs.{${query}}`)
    .eq('is_public', true)
    .order('play_count', { ascending: false })
    .limit(50);

  if (category) {
    supabaseQuery = supabaseQuery.eq('category', category);
  }

  const { data, error } = await supabaseQuery;

  if (error) {
    throw new Error(`Failed to search stories: ${error.message}`);
  }

  return data || [];
};
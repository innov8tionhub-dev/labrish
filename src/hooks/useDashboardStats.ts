import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface DashboardStats {
  storiesCreated: number;
  audioGenerated: number;
  voicesAvailable: number;
  totalPlays: number;
  weeklyGrowth: {
    stories: number;
    audio: number;
    plays: number;
  };
}

export interface MonthlyStats {
  storiesCreated: number;
  audioGenerated: number;
  totalPlays: number;
  engagement: number;
}

export interface RecentActivity {
  id: string;
  type: 'story_created' | 'audio_generated' | 'voice_trained' | 'story_shared' | 'story_played';
  title: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const useDashboardStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<DashboardStats>({
    storiesCreated: 0,
    audioGenerated: 0,
    voicesAvailable: 8,
    totalPlays: 0,
    weeklyGrowth: {
      stories: 0,
      audio: 0,
      plays: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: stories, error: storiesError } = await supabase
          .from('stories')
          .select('id, play_count, created_at')
          .eq('user_id', userId);

        if (storiesError) throw storiesError;

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

        const storiesThisWeek = stories?.filter(s =>
          new Date(s.created_at) >= oneWeekAgo
        ).length || 0;

        const totalPlays = stories?.reduce((sum, s) => sum + (s.play_count || 0), 0) || 0;

        const { data: generationData } = await supabase
          .from('user_generation_counts')
          .select('generation_count, month')
          .eq('user_id', userId)
          .in('month', [currentMonth, lastMonthStr]);

        const currentMonthData = generationData?.find(d => d.month === currentMonth);
        const lastMonthData = generationData?.find(d => d.month === lastMonthStr);

        const audioGenerated = currentMonthData?.generation_count || 0;
        const lastMonthAudio = lastMonthData?.generation_count || 0;

        const storiesGrowth = lastMonthData
          ? Math.round(((storiesThisWeek) / Math.max(stories?.length || 1, 1)) * 100)
          : 0;

        const audioGrowth = lastMonthAudio > 0
          ? Math.round(((audioGenerated - lastMonthAudio) / lastMonthAudio) * 100)
          : audioGenerated > 0 ? 100 : 0;

        const playsGrowth = 0;

        setStats({
          storiesCreated: stories?.length || 0,
          audioGenerated,
          voicesAvailable: 8,
          totalPlays,
          weeklyGrowth: {
            stories: Math.max(0, storiesGrowth),
            audio: Math.max(0, audioGrowth),
            plays: Math.max(0, playsGrowth)
          }
        });
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, loading, error };
};

export const useMonthlyStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<MonthlyStats>({
    storiesCreated: 0,
    audioGenerated: 0,
    totalPlays: 0,
    engagement: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMonthlyStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const { data: stories, error: storiesError } = await supabase
          .from('stories')
          .select('id, play_count, created_at')
          .eq('user_id', userId)
          .gte('created_at', firstDayOfMonth.toISOString());

        if (storiesError) throw storiesError;

        const { data: generationData } = await supabase
          .from('user_generation_counts')
          .select('generation_count')
          .eq('user_id', userId)
          .eq('month', currentMonth)
          .maybeSingle();

        const totalPlays = stories?.reduce((sum, s) => sum + (s.play_count || 0), 0) || 0;
        const audioGenerated = generationData?.generation_count || 0;

        const engagement = stories && stories.length > 0
          ? Math.round((totalPlays / stories.length) * 10)
          : 0;

        setStats({
          storiesCreated: stories?.length || 0,
          audioGenerated,
          totalPlays,
          engagement: Math.min(100, engagement)
        });
      } catch (err: any) {
        console.error('Failed to fetch monthly stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyStats();
  }, [userId]);

  return { stats, loading, error };
};

export const useRecentActivities = (userId: string | undefined, limit: number = 10) => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: activitiesError } = await supabase
          .from('user_activities')
          .select('id, activity_type, entity_type, entity_id, metadata, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (activitiesError) throw activitiesError;

        const formattedActivities: RecentActivity[] = (data || []).map(activity => {
          const timeAgo = getTimeAgo(new Date(activity.created_at));

          let title = 'Unknown activity';
          switch (activity.activity_type) {
            case 'story_created':
              title = `Created "${activity.metadata?.title || 'a new story'}"`;
              break;
            case 'audio_generated':
              title = `Generated audio for "${activity.metadata?.title || 'a story'}"`;
              break;
            case 'voice_trained':
              title = 'Completed voice training session';
              break;
            case 'story_shared':
              title = `Shared "${activity.metadata?.title || 'a story'}" publicly`;
              break;
            case 'story_played':
              title = `Played "${activity.metadata?.title || 'a story'}"`;
              break;
            default:
              title = activity.activity_type.replace(/_/g, ' ');
          }

          return {
            id: activity.id,
            type: activity.activity_type as RecentActivity['type'],
            title,
            timestamp: timeAgo,
            metadata: activity.metadata
          };
        });

        setActivities(formattedActivities);
      } catch (err: any) {
        console.error('Failed to fetch recent activities:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId, limit]);

  return { activities, loading, error };
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  return `${Math.floor(seconds / 2592000)} months ago`;
}

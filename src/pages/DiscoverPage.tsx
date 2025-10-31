import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, Share2, Play, Pause, ChevronLeft, TrendingUp, Sparkles, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface DiscoverStory {
  id: string;
  title: string;
  content: string;
  category: string;
  audio_url: string | null;
  user_id: string;
  creator_name: string;
  play_count: number;
  like_count: number;
  bookmark_count: number;
  created_at: string;
  duration: number;
}

export const DiscoverPage: React.FC = () => {
  const [stories, setStories] = useState<DiscoverStory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'trending' | 'new' | 'following' | 'all'>('trending');
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [bookmarkedStories, setBookmarkedStories] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadUserInteractions(user.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadStories();
    }
  }, [user, filter]);

  const loadUserInteractions = async (userId: string) => {
    try {
      const { data: interactions } = await supabase
        .from('story_interactions')
        .select('story_id, interaction_type')
        .eq('user_id', userId)
        .in('interaction_type', ['like', 'bookmark']);

      const likes = new Set<string>();
      const bookmarks = new Set<string>();

      interactions?.forEach(int => {
        if (int.interaction_type === 'like') likes.add(int.story_id);
        if (int.interaction_type === 'bookmark') bookmarks.add(int.story_id);
      });

      setLikedStories(likes);
      setBookmarkedStories(bookmarks);
    } catch (error) {
      console.error('Failed to load interactions:', error);
    }
  };

  const loadStories = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('stories')
        .select(`
          id,
          title,
          content,
          category,
          audio_url,
          user_id,
          created_at,
          duration
        `)
        .eq('visibility', 'public')
        .not('audio_url', 'is', null)
        .limit(20);

      if (filter === 'trending') {
        const { data: trendingIds } = await supabase
          .from('story_analytics')
          .select('story_id, play_count, like_count')
          .order('play_count', { ascending: false })
          .limit(20);

        const ids = trendingIds?.map(t => t.story_id) || [];
        query = query.in('id', ids.length > 0 ? ids : ['']);
      } else if (filter === 'new') {
        query = query.order('created_at', { ascending: false });
      }

      const { data: storiesData, error } = await query;

      if (error) throw error;

      const enrichedStories = await Promise.all(
        (storiesData || []).map(async (story) => {
          const { data: profile } = await supabase
            .from('creator_profiles')
            .select('display_name')
            .eq('user_id', story.user_id)
            .maybeSingle();

          const { data: analytics } = await supabase
            .from('story_analytics')
            .select('play_count, like_count, bookmark_count')
            .eq('story_id', story.id)
            .maybeSingle();

          return {
            ...story,
            creator_name: profile?.display_name || 'Anonymous',
            play_count: analytics?.play_count || 0,
            like_count: analytics?.like_count || 0,
            bookmark_count: analytics?.bookmark_count || 0,
          };
        })
      );

      setStories(enrichedStories as DiscoverStory[]);
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(false);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' && currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(false);
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, stories.length]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      trackView(stories[currentIndex].id);
      incrementCounter(stories[currentIndex].id, 'play');
    }
    setIsPlaying(!isPlaying);
  };

  const trackView = async (storyId: string) => {
    if (!user) return;

    await supabase.from('story_interactions').upsert({
      user_id: user.id,
      story_id: storyId,
      interaction_type: 'view',
    });

    await supabase.rpc('increment_story_counter', {
      p_story_id: storyId,
      p_counter_type: 'view',
    });
  };

  const incrementCounter = async (storyId: string, type: string) => {
    await supabase.rpc('increment_story_counter', {
      p_story_id: storyId,
      p_counter_type: type,
    });
  };

  const toggleLike = async () => {
    if (!user) return;

    const story = stories[currentIndex];
    const isLiked = likedStories.has(story.id);

    if (isLiked) {
      await supabase
        .from('story_interactions')
        .delete()
        .eq('user_id', user.id)
        .eq('story_id', story.id)
        .eq('interaction_type', 'like');

      setLikedStories(prev => {
        const next = new Set(prev);
        next.delete(story.id);
        return next;
      });
    } else {
      await supabase.from('story_interactions').upsert({
        user_id: user.id,
        story_id: story.id,
        interaction_type: 'like',
      });

      incrementCounter(story.id, 'like');

      setLikedStories(prev => new Set(prev).add(story.id));
    }
  };

  const toggleBookmark = async () => {
    if (!user) return;

    const story = stories[currentIndex];
    const isBookmarked = bookmarkedStories.has(story.id);

    if (isBookmarked) {
      await supabase
        .from('story_interactions')
        .delete()
        .eq('user_id', user.id)
        .eq('story_id', story.id)
        .eq('interaction_type', 'bookmark');

      setBookmarkedStories(prev => {
        const next = new Set(prev);
        next.delete(story.id);
        return next;
      });
    } else {
      await supabase.from('story_interactions').upsert({
        user_id: user.id,
        story_id: story.id,
        interaction_type: 'bookmark',
      });

      incrementCounter(story.id, 'bookmark');

      setBookmarkedStories(prev => new Set(prev).add(story.id));
    }
  };

  const handleShare = async () => {
    const story = stories[currentIndex];
    const url = `${window.location.origin}/story/${story.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: `Check out this story: ${story.title}`,
          url,
        });

        incrementCounter(story.id, 'share');
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-heading text-gray-800 mb-2">No Stories Found</h2>
          <p className="text-gray-600 mb-6">Be the first to share a public story!</p>
          <Button onClick={() => navigate('/text-to-speech')}>
            Create Story
          </Button>
        </div>
      </div>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-hidden bg-black relative"
      onWheel={handleScroll}
    >
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/50 to-transparent p-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            {[
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'new', label: 'New', icon: Sparkles },
              { id: 'all', label: 'All', icon: Users },
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                size="sm"
                variant={filter === id ? 'default' : 'ghost'}
                onClick={() => setFilter(id as any)}
                className={filter === id ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-white hover:bg-white/20'}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="h-full flex items-center justify-center relative"
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-teal-800/30 to-cyan-900/40"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto px-6 text-white">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center font-bold text-lg">
                  {currentStory.creator_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{currentStory.creator_name}</p>
                  <p className="text-sm text-gray-300 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(currentStory.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-heading mb-3">{currentStory.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                <span className="bg-emerald-600 px-3 py-1 rounded-full">{currentStory.category}</span>
                <span>{currentStory.play_count} plays</span>
                <span>{currentStory.like_count} likes</span>
              </div>

              <p className="text-lg text-gray-200 line-clamp-6">{currentStory.content}</p>
            </div>

            {currentStory.audio_url && (
              <audio
                ref={audioRef}
                src={currentStory.audio_url}
                onEnded={() => setIsPlaying(false)}
              />
            )}
          </div>

          <div className="absolute right-6 bottom-32 z-20 flex flex-col gap-6">
            <button
              onClick={togglePlay}
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" fill="white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" fill="white" />
              )}
            </button>

            <button
              onClick={toggleLike}
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex flex-col items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Heart
                className={`w-6 h-6 ${likedStories.has(currentStory.id) ? 'text-red-500' : 'text-white'}`}
                fill={likedStories.has(currentStory.id) ? 'currentColor' : 'none'}
              />
              <span className="text-xs text-white mt-1">{currentStory.like_count}</span>
            </button>

            <button
              onClick={toggleBookmark}
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex flex-col items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Bookmark
                className={`w-6 h-6 ${bookmarkedStories.has(currentStory.id) ? 'text-yellow-400' : 'text-white'}`}
                fill={bookmarkedStories.has(currentStory.id) ? 'currentColor' : 'none'}
              />
              <span className="text-xs text-white mt-1">{currentStory.bookmark_count}</span>
            </button>

            <button
              onClick={handleShare}
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
            {stories.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all ${
                  index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white/60 text-sm animate-bounce">
            Scroll or use arrow keys
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DiscoverPage;

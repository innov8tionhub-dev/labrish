import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book,
  Search,
  Filter,
  Play,
  Pause,
  Download,
  Share2,
  Edit,
  Trash2,
  Plus,
  Clock,
  Eye,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Story,
  StoryCategory,
  STORY_CATEGORIES,
  getUserStories,
  getPublicStories,
  deleteStory,
  incrementPlayCount,
  searchStories
} from '@/lib/storyLibrary';
import VoicePlayer from '@/components/VoicePlayer';
import EmptyState from '@/components/common/EmptyState';

interface StoryLibraryProps {
  onCreateNew: () => void;
  onEditStory: (story: Story) => void;
}

const StoryLibrary: React.FC<StoryLibraryProps> = ({ onCreateNew, onEditStory }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'my-stories' | 'public'>('my-stories');
  const [playingStory, setPlayingStory] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    loadStories();
  }, [viewMode, selectedCategory]);

  const loadStories = async () => {
    setLoading(true);
    try {
      let fetchedStories: Story[];

      if (viewMode === 'my-stories') {
        fetchedStories = await getUserStories(selectedCategory || undefined);
      } else {
        fetchedStories = await getPublicStories(selectedCategory || undefined);
      }

      setStories(fetchedStories);
    } catch (error: any) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadStories();
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchStories(searchQuery, selectedCategory || undefined);
      setStories(searchResults);
    } catch (error: any) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      await deleteStory(storyId);
      setStories(prev => prev.filter(s => s.id !== storyId));
    } catch (error: any) {
      alert(`Failed to delete story: ${error.message}`);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (categoryId: string): string => {
    const category = STORY_CATEGORIES.find(c => c.id === categoryId);
    return category?.color || 'from-gray-500 to-slate-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl text-gray-800">Story Library</h2>
          <p className="text-gray-600">Manage and explore your Caribbean stories</p>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Story
        </Button>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-emerald-200/50">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('my-stories')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'my-stories'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              My Stories
            </button>
            <button
              onClick={() => setViewMode('public')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'public'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Public Stories
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search stories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <Button onClick={handleSearch} variant="outline" aria-label="Search">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {STORY_CATEGORIES.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : stories.length === 0 ? (
        <EmptyState
          icon={Book}
          title={viewMode === 'my-stories' ? 'No Stories Yet' : 'No Stories Found'}
          description={
            viewMode === 'my-stories'
              ? 'Create your first Caribbean story to get started. Transform your words into authentic island voices and share your tales with the world!'
              : 'Try adjusting your search or category filter to discover more stories. The Caribbean storytelling community is waiting for you!'
          }
          actionLabel={viewMode === 'my-stories' ? 'Create First Story' : 'Clear Filters'}
          onAction={viewMode === 'my-stories' ? onCreateNew : () => {
            setSearchQuery('');
            setSelectedCategory('');
          }}
          secondaryActionLabel={viewMode === 'my-stories' ? 'Explore Public Stories' : 'View My Stories'}
          onSecondaryAction={() => setViewMode(viewMode === 'my-stories' ? 'public' : 'my-stories')}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                viewMode={viewMode}
                getCategoryColor={getCategoryColor}
                formatDuration={formatDuration}
                onEditStory={onEditStory}
                onDeleteStory={handleDeleteStory}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

interface StoryCardProps {
  story: Story;
  viewMode: 'my-stories' | 'public';
  getCategoryColor: (categoryId: string) => string;
  formatDuration: (seconds: number) => string;
  onEditStory: (story: Story) => void;
  onDeleteStory: (storyId: string) => void;
}

const StoryCard = memo<StoryCardProps>(({
  story,
  viewMode,
  getCategoryColor,
  formatDuration,
  onEditStory,
  onDeleteStory
}) => (
  <motion.div
    className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 overflow-hidden hover:shadow-xl transition-shadow"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    layout
  >
    <div className={`h-2 bg-gradient-to-r ${getCategoryColor(story.category)}`} />

    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="font-heading text-lg text-gray-800 mb-1 line-clamp-2">
          {story.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="capitalize">{story.category}</span>
          {story.duration && (
            <>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{formatDuration(story.duration)}</span>
            </>
          )}
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {story.content}
      </p>

      {story.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {story.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {story.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{story.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{story.play_count}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(story.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {story.audio_url && (
          <VoicePlayer
            url={story.audio_url}
            name={story.title}
            className="flex-1"
            variant="default"
            onPlay={() => incrementPlayCount(story.id)}
          />
        )}

        {viewMode === 'my-stories' ? (
          <>
            <Button
              onClick={() => onEditStory(story)}
              size="sm"
              variant="outline"
              aria-label={`Edit ${story.title}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onDeleteStory(story.id)}
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:border-red-300"
              aria-label={`Delete ${story.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" aria-label="Download story">
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" aria-label="Share story">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" aria-label="Like story">
              <Heart className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  </motion.div>
));

StoryCard.displayName = 'StoryCard';

export default StoryLibrary;
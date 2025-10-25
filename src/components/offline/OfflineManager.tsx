import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Trash2,
  CloudOff,
  CheckCircle,
  Clock,
  HardDrive,
  RefreshCw,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { offlineCacheManager, CachedStory, CacheInfo } from '@/lib/offlineCacheManager';
import { useToast } from '@/components/common/Toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

interface OfflineManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const OfflineManager: React.FC<OfflineManagerProps> = ({ isOpen, onClose }) => {
  const [cachedStories, setCachedStories] = useState<CachedStory[]>([]);
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [clearing, setClearing] = useState(false);

  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadCacheData();
    }
  }, [isOpen]);

  const loadCacheData = async () => {
    setLoading(true);
    try {
      const [stories, info] = await Promise.all([
        offlineCacheManager.getCachedStories(),
        offlineCacheManager.getCacheInfo()
      ]);
      setCachedStories(stories);
      setCacheInfo(info);
    } catch (error: any) {
      console.error('Failed to load cache data:', error);
      showError('Loading failed', 'Could not load offline cache data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (story: CachedStory) => {
    setDeletingIds(prev => new Set([...prev, story.id]));
    try {
      await offlineCacheManager.deleteCachedAudio(story.audio_url, story.story_id);
      showSuccess('Removed', 'Story removed from offline storage');
      await loadCacheData();
    } catch (error: any) {
      showError('Delete failed', error.message);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(story.id);
        return newSet;
      });
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all offline stories? This cannot be undone.')) {
      return;
    }

    setClearing(true);
    try {
      await offlineCacheManager.clearAllCache();
      showSuccess('Cache cleared', 'All offline stories have been removed');
      await loadCacheData();
    } catch (error: any) {
      showError('Clear failed', error.message);
    } finally {
      setClearing(false);
    }
  };

  const handleCleanup = async () => {
    try {
      await offlineCacheManager.cleanupExpiredCache();
      showSuccess('Cleanup complete', 'Expired stories removed');
      await loadCacheData();
    } catch (error: any) {
      showError('Cleanup failed', error.message);
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CloudOff className="w-6 h-6 text-emerald-600" />
                <div>
                  <h2 className="text-2xl font-heading text-gray-800">Offline Storage</h2>
                  <p className="text-sm text-gray-600">Manage downloaded stories for offline listening</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close offline manager"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {cacheInfo && (
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-gray-700">Storage Used</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {offlineCacheManager.formatBytes(cacheInfo.size)} / {offlineCacheManager.formatBytes(cacheInfo.maxSize)}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      cacheInfo.percentageUsed > 90
                        ? 'bg-red-500'
                        : cacheInfo.percentageUsed > 70
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(cacheInfo.percentageUsed, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                  <span>{cacheInfo.count} / {cacheInfo.maxItems} stories</span>
                  <span>{cacheInfo.percentageUsed.toFixed(1)}% used</span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : cachedStories.length === 0 ? (
                <EmptyState
                  icon={Download}
                  title="No offline stories"
                  description="Download stories to listen offline. Look for the download button on story pages."
                />
              ) : (
                <div className="space-y-3">
                  {cachedStories.map((story, index) => (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {story.metadata.title || 'Untitled Story'}
                          </h3>

                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(story.metadata.duration)}</span>
                            </div>
                            <span>•</span>
                            <span>{offlineCacheManager.formatBytes(story.cache_size)}</span>
                            <span>•</span>
                            <span>Last played {formatDate(story.last_accessed)}</span>
                          </div>

                          <div className="mt-2 text-xs text-gray-500">
                            Expires: {new Date(story.expires_at).toLocaleDateString()}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(story)}
                          disabled={deletingIds.has(story.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          aria-label="Remove from offline storage"
                        >
                          {deletingIds.has(story.id) ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {cachedStories.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between gap-4">
                <Button
                  onClick={handleCleanup}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clean Expired
                </Button>

                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  size="sm"
                  disabled={clearing}
                  className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  {clearing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineManager;

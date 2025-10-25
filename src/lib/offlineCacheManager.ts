import { supabase } from './supabase';

export interface CachedStory {
  id: string;
  story_id: string;
  audio_url: string;
  cache_size: number;
  download_status: 'pending' | 'downloading' | 'cached' | 'failed' | 'expired';
  expires_at: string;
  last_accessed: string;
  metadata: {
    title: string;
    duration?: number;
    voice_id?: string;
  };
}

export interface CacheInfo {
  size: number;
  count: number;
  maxSize: number;
  maxItems: number;
  percentageUsed: number;
}

class OfflineCacheManager {
  private sw: ServiceWorker | null = null;

  constructor() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        this.sw = registration.active;
      });
    }
  }

  private sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.sw) {
        reject(new Error('Service Worker not available'));
        return;
      }

      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve(event.data.data || event.data);
        } else {
          reject(new Error(event.data.error || 'Operation failed'));
        }
      };

      this.sw.postMessage(message, [messageChannel.port2]);
    });
  }

  async cacheAudio(url: string, storyId: string, metadata: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await this.sendMessage({
        type: 'CACHE_AUDIO',
        url
      });

      const audioSize = await this.getAudioSize(url);

      const { error } = await supabase
        .from('offline_cache_manifest')
        .upsert([{
          user_id: user.id,
          story_id: storyId,
          audio_url: url,
          cache_size: audioSize,
          download_status: 'cached',
          metadata
        }], {
          onConflict: 'user_id,story_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to cache audio:', error);
      throw error;
    }
  }

  async deleteCachedAudio(url: string, storyId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await this.sendMessage({
        type: 'DELETE_CACHED_AUDIO',
        url
      });

      const { error } = await supabase
        .from('offline_cache_manifest')
        .delete()
        .eq('user_id', user.id)
        .eq('story_id', storyId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete cached audio:', error);
      throw error;
    }
  }

  async getCacheInfo(): Promise<CacheInfo> {
    try {
      const data = await this.sendMessage({
        type: 'GET_CACHE_INFO'
      });

      return {
        ...data,
        percentageUsed: (data.size / data.maxSize) * 100
      };
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return {
        size: 0,
        count: 0,
        maxSize: 100 * 1024 * 1024,
        maxItems: 100,
        percentageUsed: 0
      };
    }
  }

  async getCachedStories(): Promise<CachedStory[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('offline_cache_manifest')
        .select('*')
        .eq('user_id', user.id)
        .eq('download_status', 'cached')
        .order('last_accessed', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get cached stories:', error);
      return [];
    }
  }

  async updateLastAccessed(storyId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('offline_cache_manifest')
        .update({ last_accessed: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('story_id', storyId);

      if (error) console.error('Failed to update last accessed:', error);
    } catch (error) {
      console.error('Error updating last accessed:', error);
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      await this.sendMessage({
        type: 'CLEAR_CACHE'
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('offline_cache_manifest')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  async cleanupExpiredCache(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date().toISOString();

      const { data: expired, error: fetchError } = await supabase
        .from('offline_cache_manifest')
        .select('audio_url, story_id')
        .eq('user_id', user.id)
        .lt('expires_at', now);

      if (fetchError) throw fetchError;

      if (expired && expired.length > 0) {
        for (const item of expired) {
          await this.deleteCachedAudio(item.audio_url, item.story_id);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup expired cache:', error);
    }
  }

  private async getAudioSize(url: string): Promise<number> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength, 10) : 0;
    } catch {
      return 0;
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async queueOfflineAction(action: {
    type: string;
    payload: any;
  }): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('offline_sync_queue')
        .insert([{
          user_id: user.id,
          action_type: action.type,
          payload: action.payload,
          status: 'queued'
        }]);

      if (error) throw error;

      if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-offline-queue');
      }
    } catch (error) {
      console.error('Failed to queue offline action:', error);
    }
  }

  async getSyncQueueCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('offline_sync_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'queued');

      if (error) throw error;
      return count || 0;
    } catch {
      return 0;
    }
  }
}

export const offlineCacheManager = new OfflineCacheManager();

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoicePlayerProps {
  url: string;
  name?: string;
  onPlay?: () => void;
  onStop?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

// Global audio context to ensure only one audio plays at a time
const globalAudioContext = {
  currentAudio: null as HTMLAudioElement | null,
  currentPlayerId: null as string | null,
};

const VoicePlayer: React.FC<VoicePlayerProps> = ({
  url,
  name,
  onPlay,
  onStop,
  className = '',
  size = 'md',
  variant = 'outline',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerIdRef = useRef<string>(crypto.randomUUID());

  // Size classes for the button
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  // Variant classes for the button
  const variantClasses = {
    default: 'bg-emerald-500 text-white hover:bg-emerald-600',
    outline: 'border border-gray-300 hover:bg-gray-100',
    ghost: 'hover:bg-gray-100',
  };

  // Clean up function to properly dispose audio resources
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }
      audioRef.current.src = '';
      audioRef.current.load();
    }
  }, []);

  // Stop all other audio players
  const stopOtherPlayers = useCallback(() => {
    if (globalAudioContext.currentAudio && 
        globalAudioContext.currentPlayerId !== playerIdRef.current) {
      globalAudioContext.currentAudio.pause();
      globalAudioContext.currentAudio.currentTime = 0;
      // The ended event will handle state cleanup in the other player
    }
  }, []);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onStop) onStop();
      if (globalAudioContext.currentPlayerId === playerIdRef.current) {
        globalAudioContext.currentAudio = null;
        globalAudioContext.currentPlayerId = null;
      }
    };
    
    const handleError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      setError('Failed to play audio');
      setIsPlaying(false);
      setIsLoading(false);
      if (onStop) onStop();
    };
    
    const handleCanPlay = () => {
      setIsLoading(false);
      if (isPlaying) {
        audio.play().catch(err => {
          console.error('Failed to play audio:', err);
          setIsPlaying(false);
          setError('Playback failed');
          if (onStop) onStop();
        });
      }
    };
    
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as EventListener);
    audio.addEventListener('canplay', handleCanPlay);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as EventListener);
      audio.removeEventListener('canplay', handleCanPlay);
      cleanupAudio();
    };
  }, [cleanupAudio, onStop]);

  // Handle play/pause
  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (onStop) onStop();
      if (globalAudioContext.currentPlayerId === playerIdRef.current) {
        globalAudioContext.currentAudio = null;
        globalAudioContext.currentPlayerId = null;
      }
    } else {
      setError(null);
      setIsLoading(true);
      
      // Stop any other playing audio
      stopOtherPlayers();
      
      // Set current audio in global context
      globalAudioContext.currentAudio = audioRef.current;
      globalAudioContext.currentPlayerId = playerIdRef.current;
      
      // Set source if not already set
      if (audioRef.current.src !== url) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
      
      // Try to play
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        if (onPlay) onPlay();
      }).catch(err => {
        console.error('Failed to play audio:', err);
        setIsPlaying(false);
        setIsLoading(false);
        setError('Playback failed');
      });
    }
  }, [isPlaying, onPlay, onStop, stopOtherPlayers, url]);

  // Update audio source if URL changes
  useEffect(() => {
    if (audioRef.current && audioRef.current.src !== url) {
      const wasPlaying = !audioRef.current.paused;
      
      if (wasPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (onStop) onStop();
      }
      
      audioRef.current.src = url;
      audioRef.current.load();
      
      if (wasPlaying) {
        togglePlayback();
      }
    }
  }, [url, togglePlayback, onStop]);

  return (
    <div className={cn("flex items-center", className)}>
      <Button
        type="button"
        onClick={togglePlayback}
        disabled={isLoading || !!error}
        className={cn(
          "rounded-full flex items-center justify-center",
          sizeClasses[size],
          variantClasses[variant],
          isPlaying ? "bg-red-500 hover:bg-red-600 text-white border-red-500" : "",
          isLoading ? "opacity-70 cursor-wait" : "",
          error ? "bg-red-100 text-red-500 border-red-300 cursor-not-allowed" : ""
        )}
        aria-label={isPlaying ? `Stop ${name || 'audio'}` : `Play ${name || 'audio'}`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : error ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>
      
      {error && (
        <span className="ml-2 text-xs text-red-500" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default VoicePlayer;
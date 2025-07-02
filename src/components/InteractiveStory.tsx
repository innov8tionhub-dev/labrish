import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Sparkles, MapPin, Book, Clock, VolumeX } from 'lucide-react';

// Format time from seconds to MM:SS
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Audio URLs for the stories
// Using sample audio URLs for demonstration
const STORY_AUDIO = {
  'anansi-start': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/generated-stories/CaribbeanTrickster-Anansi_Golden_Mango.mp3`,
  'pirate-start': `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/generated-stories/CaptainMaria-PortRoyal.mp3`
};

// Audio durations (in seconds)
const AUDIO_DURATIONS = {
  'anansi-start': 58, // 0:58 duration
  'pirate-start': 58  // 0:58 duration
};

// Global audio context to ensure only one audio plays at a time
const GlobalAudioContext = React.createContext<{
  currentPlayingId: string | null;
  setCurrentPlayingId: (id: string | null) => void;
}>({
  currentPlayingId: null,
  setCurrentPlayingId: () => {},
});

// Simple Audio Player Component
const SimpleAudioPlayer: React.FC<{ 
  id: string;
  title: string; 
  description: string;
  audioUrl: string;
  defaultDuration: number;
  icon: React.ReactNode;
  category: string;
}> = ({ id, title, description, audioUrl, defaultDuration, icon, category }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(defaultDuration);
  const [error, setError] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentPlayingId, setCurrentPlayingId } = React.useContext(GlobalAudioContext);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    
    console.log("Loading audio from URL:", audioUrl);

    // Reset error state on new audio initialization
    setError(null);
    
    // Add event listeners
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentPlayingId(null);
      setCurrentTime(0);
    };
    
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
    
    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setTotalDuration(audioRef.current.duration);
      }
    };
    
    const handleError = (e: ErrorEvent) => {
      const target = e.target as HTMLAudioElement;
      console.error('Audio playback error:', e, target.error);
      
      // More detailed error message
      const errorMsg = target.error ? 
        `Error: ${target.error.message || target.error.code}` : 
        'Error playing audio';
        
      setError(errorMsg);
      setIsPlaying(false);
      setCurrentPlayingId(null);
      setLoadingAudio(false);
    };
    
    const audio = audioRef.current;
    audio.addEventListener('ended', handleEnded, false);
    audio.addEventListener('timeupdate', handleTimeUpdate, false);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata, false);
    audio.addEventListener('error', handleError as unknown as EventListener, false);
    
    // Cleanup function
    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('error', handleError as unknown as EventListener);
        audio.src = ''; // Clear source to prevent memory leaks
        URL.revokeObjectURL(audio.src); // Free up memory if using blob URLs
      }
      audioRef.current = null;
    };
  }, [audioUrl, setCurrentPlayingId]);
  
  // Handle play state changes from global context
  useEffect(() => {
    // If this is not the currently playing audio, pause it
    if (currentPlayingId !== id && isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [currentPlayingId, id, isPlaying]);
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentPlayingId(null);  
    } else {
      // If another audio is playing, it will be stopped by the effect above
      setLoadingAudio(true);
      setError(null);
      setCurrentPlayingId(id);
      audioRef.current.play()
        .then(() => {
          console.log("Audio playing successfully");
          setIsPlaying(true);
          setLoadingAudio(false);
        })
        .catch(error => {
          console.error('Error playing audio:', error);
          setError('Error playing audio');
          setIsPlaying(false);
          setCurrentPlayingId(null);
          setLoadingAudio(false);
        });
    }
  };

  // Seek to a specific position in the audio
  const seekAudio = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || totalDuration <= 0) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    
    if (percentage >= 0 && percentage <= 1) {
      const newTime = percentage * totalDuration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-caribbean-200/50 hover:shadow-2xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={`w-16 h-16 bg-gradient-to-r ${category === 'folklore' ? 'from-amber-500 to-orange-500' : 'from-blue-500 to-cyan-500'} rounded-full flex items-center justify-center text-white mb-6 mx-auto`}>
        {icon}
      </div>
      <h3 className="font-heading text-2xl mb-3 text-gray-800 text-center">{title}</h3>
      <p className="font-body text-gray-600 text-center mb-6">{description}</p>
      
      {/* Audio Player UI */}
      <div className="p-4 bg-gray-50 rounded-xl space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            disabled={!!error || loadingAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
              error ? 'bg-gray-400' : 'bg-gradient-to-r from-caribbean-500 to-teal-500 hover:shadow-md'
            } transition-all duration-200`}
            aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
          >
            {loadingAudio ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : error ? (
              <VolumeX className="w-5 h-5" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Audio Story</p>
            <p className="text-xs text-gray-500">
              {error ? (
                <span className="text-red-500">Playback error</span>
              ) : (
                `Duration: ${formatTime(totalDuration > 0 ? totalDuration : defaultDuration)}`
              )}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-1">
          <div 
            className="h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
            onClick={isPlaying || currentTime > 0 ? seekAudio : undefined}
            title="Click to seek"
          >
            <div 
              className={`h-full rounded-full ${
                error ? 'bg-red-400' : 'bg-gradient-to-r from-caribbean-500 to-teal-500'
              }`}
              style={{ 
                width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`,
                transition: isPlaying ? 'width 0.1s linear' : 'none'
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration > 0 ? totalDuration : defaultDuration)}</span>
          </div>
        </div>
        
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-500 text-xs text-center p-2 bg-red-50 rounded-lg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Retry Button when error occurs */}
        {error && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              setError(null);
              if (audioRef.current) {
                audioRef.current.load();
                setLoadingAudio(true);
                audioRef.current.play()
                  .then(() => {
                    setIsPlaying(true);
                    setLoadingAudio(false);
                  })
                  .catch(err => {
                    console.error('Retry failed:', err);
                    setError('Playback failed. Please try again later.');
                    setLoadingAudio(false);
                  });
              }
            }}
            className="mt-2 text-xs text-center w-full py-1 text-blue-600 hover:text-blue-800 underline"
          >
            Retry playback
          </motion.button>
        )}
      </div>
      
      {/* Tags */}
      <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-4">
        <span className="flex items-center gap-1">
          <Book className="w-4 h-4" />
          {category}
        </span>
        <span className="flex items-center gap-1" title="Duration">
          <Clock className="w-4 h-4" /> 
          {formatTime(totalDuration > 0 ? totalDuration : defaultDuration)}
        </span>
      </div>
    </motion.div>
  );
};

const InteractiveStory: React.FC = () => {
  // Global state for tracking which audio is playing
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  
  return (
    <GlobalAudioContext.Provider value={{ currentPlayingId, setCurrentPlayingId }}>
      <section className="py-16 bg-gradient-to-br from-caribbean-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="font-heading text-4xl mb-4 text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Interactive Caribbean Stories
            </motion.h2>
            <motion.p
              className="font-body text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Choose your adventure and experience immersive storytelling with authentic Caribbean voices
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <SimpleAudioPlayer
              id="anansi-start"
              title="Anansi and the Golden Mango"
              description="A classic Caribbean folktale about wisdom and generosity"
              audioUrl={STORY_AUDIO['anansi-start']}
              defaultDuration={AUDIO_DURATIONS['anansi-start']}
              icon={<Sparkles className="w-6 h-6" />}
              category="folklore"
            />
            
            <SimpleAudioPlayer
              id="pirate-start"
              title="The Lost Treasure of Port Royal"
              description="An adventure on the high seas of the Caribbean"
              audioUrl={STORY_AUDIO['pirate-start']}
              defaultDuration={AUDIO_DURATIONS['pirate-start']}
              icon={<MapPin className="w-6 h-6" />}
              category="adventure"
            />
          </div>
        </div>
      </section>
    </GlobalAudioContext.Provider>
  );
};

export default InteractiveStory;
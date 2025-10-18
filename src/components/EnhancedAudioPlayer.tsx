import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Download,
  Share2,
  Save,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedAudioPlayerProps {
  audioUrl: string;
  audioBlob: Blob | null;
  onDownload?: () => void;
  onShare?: () => void;
  onSave?: () => void;
}

const EnhancedAudioPlayer: React.FC<EnhancedAudioPlayerProps> = ({
  audioUrl,
  audioBlob,
  onDownload,
  onShare,
  onSave
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showPlaybackMenu, setShowPlaybackMenu] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioBlob) {
      generateSimpleWaveform(audioBlob);
    }
  }, [audioBlob]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const generateSimpleWaveform = async (blob: Blob) => {
    const samples = 100;
    const data = new Array(samples).fill(0).map(() => Math.random() * 0.5 + 0.5);
    setWaveformData(data);
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const handleSkipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="font-heading text-xl text-gray-800 mb-6">Audio Player</h3>

      <audio ref={audioRef} src={audioUrl} className="hidden" />

      {/* Waveform Visualization */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-end justify-between h-24 gap-1">
          {waveformData.map((height, index) => {
            const isPlayed = (index / waveformData.length) * 100 < progress;
            return (
              <div
                key={index}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPlayed
                    ? 'bg-gradient-to-t from-emerald-500 to-teal-500'
                    : 'bg-gray-300'
                }`}
                style={{ height: `${height * 100}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        ref={progressBarRef}
        className="mb-4 cursor-pointer"
        onClick={handleSeek}
      >
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <Button
          onClick={handleSkipBackward}
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0"
          aria-label="Skip backward 10 seconds"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          onClick={handlePlayPause}
          className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </Button>

        <Button
          onClick={handleStop}
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0"
          aria-label="Stop"
        >
          <Square className="w-4 h-4" />
        </Button>

        <Button
          onClick={handleSkipForward}
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0"
          aria-label="Skip forward 10 seconds"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Additional Controls */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
        {/* Volume Control */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={toggleMute}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (parseFloat(e.target.value) > 0) setIsMuted(false);
            }}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="Volume"
          />
        </div>

        {/* Playback Speed */}
        <div className="relative">
          <button
            onClick={() => setShowPlaybackMenu(!showPlaybackMenu)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            aria-label="Playback speed"
          >
            <Gauge className="w-4 h-4" />
            <span>{playbackRate}x</span>
          </button>

          {showPlaybackMenu && (
            <motion.div
              className="absolute right-0 bottom-full mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[100px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {playbackRates.map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setPlaybackRate(rate);
                    setShowPlaybackMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                    rate === playbackRate ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {onDownload && (
          <Button onClick={onDownload} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
        {onSave && (
          <Button onClick={onSave} variant="outline" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        )}
        {onShare && (
          <Button onClick={onShare} variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedAudioPlayer;

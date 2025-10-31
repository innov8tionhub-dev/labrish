import React from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Download,
  Share2,
  Save,
  SkipBack,
  SkipForward,
  Waveform
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AudioPlayerProvider,
  AudioPlayerButton,
  AudioPlayerProgress,
  AudioPlayerTime,
  AudioPlayerDuration,
  AudioPlayerSpeedButtonGroup,
  AudioPlayerItem,
  useAudioPlayer,
} from '@/components/ui/audio-player';

interface EnhancedAudioPlayerV2Props {
  audioUrl: string;
  audioBlob: Blob | null;
  onDownload?: () => void;
  onShare?: () => void;
  onSave?: () => void;
}

function PlayerControls({
  onDownload,
  onShare,
  onSave,
}: {
  onDownload?: () => void;
  onShare?: () => void;
  onSave?: () => void;
}) {
  const { ref, seek } = useAudioPlayer();
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, ref]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSkipBackward = () => {
    if (ref.current) {
      seek(Math.max(0, ref.current.currentTime - 10));
    }
  };

  const handleSkipForward = () => {
    if (ref.current && ref.current.duration) {
      seek(Math.min(ref.current.duration, ref.current.currentTime + 10));
    }
  };

  return (
    <>
      {/* Skip Controls */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <Button
          onClick={handleSkipBackward}
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <AudioPlayerButton className="w-14 h-14 rounded-full" />

        <Button
          onClick={handleSkipForward}
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Volume and Speed Controls */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
        {/* Volume Control */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={toggleMute}
            className="text-gray-600 hover:text-emerald-600 transition-colors"
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
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500 [&::-moz-range-thumb]:border-0"
          />
        </div>

        {/* Playback Speed */}
        <AudioPlayerSpeedButtonGroup speeds={[0.5, 0.75, 1, 1.25, 1.5, 2]} />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        {onDownload && (
          <Button
            onClick={onDownload}
            variant="outline"
            size="sm"
            className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
        {onShare && (
          <Button
            onClick={onShare}
            variant="outline"
            size="sm"
            className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
        {onSave && (
          <Button
            onClick={onSave}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Story
          </Button>
        )}
      </div>
    </>
  );
}

const EnhancedAudioPlayerV2: React.FC<EnhancedAudioPlayerV2Props> = ({
  audioUrl,
  audioBlob,
  onDownload,
  onShare,
  onSave,
}) => {
  const audioItem: AudioPlayerItem = {
    id: 'current-audio',
    src: audioUrl,
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-200/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
          <Waveform className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-heading text-xl text-gray-800">Audio Player</h3>
          <p className="text-sm text-gray-500">Listen to your Caribbean voice creation</p>
        </div>
      </div>

      <AudioPlayerProvider>
        {/* Progress Bar */}
        <div className="mb-6">
          <AudioPlayerProgress />
          <div className="flex justify-between text-sm mt-2">
            <AudioPlayerTime />
            <AudioPlayerDuration />
          </div>
        </div>

        <PlayerControls
          onDownload={onDownload}
          onShare={onShare}
          onSave={onSave}
        />

        {/* Hidden audio item to set the source */}
        <div className="hidden">
          <AudioPlayerButton item={audioItem} />
        </div>
      </AudioPlayerProvider>
    </motion.div>
  );
};

export default EnhancedAudioPlayerV2;

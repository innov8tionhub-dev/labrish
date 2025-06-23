import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  Volume2, 
  Download, 
  Play, 
  Pause, 
  Square, 
  Loader2, 
  FileText,
  Settings,
  Save,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateSpeech, getAvailableVoices, Voice } from '@/lib/elevenlabs';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

const TextToSpeechPage: React.FC = () => {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM'); // Default Rachel voice
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
    };
    getUser();
  }, [navigate]);

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const voices = await getAvailableVoices();
        setAvailableVoices(voices);
      } catch (error) {
        console.error('Failed to load voices:', error);
      } finally {
        setVoicesLoading(false);
      }
    };
    
    if (user) {
      loadVoices();
    }
  }, [user]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, [audioUrl]);

  const handleGenerateSpeech = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    try {
      const audioBlob = await generateSpeech(text, selectedVoice, voiceSettings);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error: any) {
      console.error('Speech generation failed:', error);
      alert(error.message || 'Failed to generate speech');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

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
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `labrish-speech-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getVoicePreview = (voice: Voice) => {
    return voice.preview_url || null;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-4xl md:text-5xl text-gray-800 mb-4">
              Text-to-Speech Studio
            </h1>
            <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your text into authentic Caribbean voices with AI-powered speech synthesis
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Text Input Section */}
            <motion.div 
              className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-200/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-emerald-600" />
                <h2 className="font-heading text-2xl text-gray-800">Your Text</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your text (max 2,500 characters)
                  </label>
                  <textarea
                    id="text-input"
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, 2500))}
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    placeholder="Enter the text you want to convert to speech. Try writing a Caribbean story or dialogue..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {text.length}/2,500 characters
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload File
                    </Button>
                  </div>
                </div>

                {/* Quick Text Examples */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick Examples:</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      "Welcome to Jamaica, where every sunset tells a story and every breeze carries the rhythm of the islands.",
                      "Once upon a time, in a small Caribbean village, there lived a wise old fisherman who knew the secrets of the sea.",
                      "The steel drums echoed across the beach as the festival began, bringing together people from all corners of the island.",
                      "Mi tell yuh, dis island life sweet like sugar cane, and every day bring new adventure."
                    ].map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setText(example)}
                        className="p-3 text-left text-sm bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                      >
                        {example.slice(0, 60)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateSpeech}
                  disabled={!text.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-4 text-lg font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Speech...
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Generate Speech
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Voice Selection & Controls */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Voice Selection */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-xl text-gray-800">Voice Selection</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>

                {voicesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableVoices.slice(0, 6).map((voice) => (
                      <div
                        key={voice.voice_id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedVoice === voice.voice_id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                        onClick={() => setSelectedVoice(voice.voice_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{voice.name}</p>
                            <p className="text-sm text-gray-600">{voice.category}</p>
                          </div>
                          {voice.preview_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                const audio = new Audio(voice.preview_url);
                                audio.play();
                              }}
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Voice Settings */}
                {showSettings && (
                  <motion.div 
                    className="mt-6 pt-6 border-t border-gray-200 space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="font-medium text-gray-800">Voice Settings</h4>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Stability: {voiceSettings.stability}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={voiceSettings.stability}
                        onChange={(e) => setVoiceSettings(prev => ({
                          ...prev,
                          stability: parseFloat(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Clarity: {voiceSettings.similarity_boost}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={voiceSettings.similarity_boost}
                        onChange={(e) => setVoiceSettings(prev => ({
                          ...prev,
                          similarity_boost: parseFloat(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Style: {voiceSettings.style}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={voiceSettings.style}
                        onChange={(e) => setVoiceSettings(prev => ({
                          ...prev,
                          style: parseFloat(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="speaker-boost"
                        checked={voiceSettings.use_speaker_boost}
                        onChange={(e) => setVoiceSettings(prev => ({
                          ...prev,
                          use_speaker_boost: e.target.checked
                        }))}
                        className="rounded"
                      />
                      <label htmlFor="speaker-boost" className="text-sm text-gray-600">
                        Speaker Boost
                      </label>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Audio Controls */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50">
                <h3 className="font-heading text-xl text-gray-800 mb-4">Audio Player</h3>
                
                {audioUrl ? (
                  <div className="space-y-4">
                    <audio ref={audioRef} src={audioUrl} className="hidden" />
                    
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={handlePlayPause}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                      
                      <Button
                        onClick={handleStop}
                        variant="outline"
                      >
                        <Square className="w-5 h-5" />
                      </Button>
                      
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                      >
                        <Download className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save to Library
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Generate speech to see audio controls</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechPage;
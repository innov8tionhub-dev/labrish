import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Download, Play, Pause, Square, Loader2, FileText, Settings, Save, Upload, Book, AudioWaveform as Waveform, Share2, ChevronLeft, BookOpen, Maximize2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateSpeech, getAvailableVoices, Voice } from '@/lib/elevenlabs';
import { supabase } from '@/lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FileUploadZone from '@/components/FileUploadZone';
import StoryLibrary from '@/components/StoryLibrary';
import { saveStory, Story, STORY_CATEGORIES } from '@/lib/storyLibrary';
import StoryTemplateGallery from '@/components/StoryTemplateGallery';
import { StoryTemplate } from '@/lib/storyTemplates';
import { getAudioMetadata, generateWaveformData, createAudioVisualization } from '@/lib/audioUtils';
import { FileUploadResult } from '@/lib/fileUpload';
import { useOfflineSupport, offlineManager, cacheManager } from '@/lib/offlineSupport';
import VoicePlayer from '@/components/VoicePlayer';
import { Crown } from 'lucide-react';
import { logAudioGeneration, logStoryCreated, logStoryShared } from '@/lib/activityLogger';
import EnhancedAudioPlayer from '@/components/EnhancedAudioPlayer';
import { StoryPromptGenerator } from '@/components/ai/StoryPromptGenerator';
import { DialectEnhancer } from '@/components/ai/DialectEnhancer';
import { StoryExpander } from '@/components/ai/StoryExpander';
import { CulturalContextPanel } from '@/components/ai/CulturalContextPanel';
import { StoryPolisher } from '@/components/ai/StoryPolisher';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

const TextToSpeechPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM');
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showExpander, setShowExpander] = useState(false);
  const [showCulturalContext, setShowCulturalContext] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Story saving state
  const [storyTitle, setStoryTitle] = useState('');
  const [storyCategory, setStoryCategory] = useState('folklore');
  const [storyTags, setStoryTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  // Tier and usage state
  const [userTier, setUserTier] = useState<'free' | 'pro'>('free');
  const [generationCount, setGenerationCount] = useState<number>(0);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(5); // Default to free tier
  const [showUpgradePrompt, setShowUpgradePrompt] = useState<boolean>(false);

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isOnline, queueSize } = useOfflineSupport();

  // Memory leak fix: Clean up audio URLs
  useEffect(() => {
    return () => {
      // Cleanup audio URL when component unmounts
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  // Memory leak fix: Clean up previous audio URL when new one is created
  useEffect(() => {
    return () => {
      // This cleanup function will run when audioUrl changes or component unmounts
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const loadUserTierAndUsage = async () => {
    try {
      // Check subscription status to determine tier
      const { data: subscription } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status')
        .maybeSingle();
      
      const isPro = subscription?.subscription_status === 'active' || 
                    subscription?.subscription_status === 'trialing';
      
      setUserTier(isPro ? 'pro' : 'free');
      setMonthlyLimit(isPro ? 40 : 5);
      
      // Get current month's usage
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const { data: generationData } = await supabase
        .from('user_generation_counts')
        .select('generation_count')
        .eq('month', currentMonth)
        .maybeSingle();
      
      setGenerationCount(generationData?.generation_count || 0);
      
      // Show upgrade prompt if approaching limit
      if (!isPro && generationData?.generation_count && generationData.generation_count >= 3) {
        setShowUpgradePrompt(true);
      }
    } catch (error) {
      console.error('Failed to load user tier and usage:', error);
    }
  };

  // Load user and tier information
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        loadUserTierAndUsage();
      }
    };
    getUser();
  }, []);

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

  // Generate waveform when audio is loaded
  useEffect(() => {
    if (audioBlob) {
      generateWaveformData(audioBlob).then(data => {
        setWaveformData(data);
        if (canvasRef.current) {
          createAudioVisualization(canvasRef.current, data);
        }
      });
    }
  }, [audioBlob]);

  // Handle continue story from dashboard
  useEffect(() => {
    const continueStoryId = searchParams.get('continue');
    if (continueStoryId && user) {
      const loadStory = async () => {
        try {
          const { data: story } = await supabase
            .from('stories')
            .select('*')
            .eq('id', continueStoryId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (story) {
            setText(story.content || '');
            setStoryTitle(story.title || '');
            setStoryCategory(story.category || 'folklore');
            setStoryTags(story.tags || []);
            if (story.voice_id) {
              setSelectedVoice(story.voice_id);
            }
            if (story.voice_settings) {
              setVoiceSettings(story.voice_settings);
            }
            setEditingStory(story);
          }
        } catch (error) {
          console.error('Failed to load story:', error);
        }
      };
      loadStory();
    }
  }, [searchParams, user]);

  const handleGenerateSpeech = async () => {
    if (!text.trim()) return;

    if (generationCount >= monthlyLimit) {
      if (userTier === 'free') {
        alert(`You've reached your monthly limit of ${monthlyLimit} generations. Please upgrade to Labrish Pro for more generations.`);
        setShowUpgradePrompt(true);
      } else {
        alert(`You've reached your monthly limit of ${monthlyLimit} generations. Your limit will reset next month.`);
      }
      return;
    }

    setIsGenerating(true);
    try {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      if (!isOnline) {
        const requestId = offlineManager.queueRequest(
          '/api/generate-speech',
          'POST',
          { 'Content-Type': 'application/json' },
          JSON.stringify({ text, voice_id: selectedVoice, voice_settings: voiceSettings })
        );

        alert(`You're offline. Speech generation has been queued and will process when you're back online. (Queue ID: ${requestId})`);
        return;
      }

      const blob = await generateSpeech(text, selectedVoice, voiceSettings);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioBlob(blob);

      await loadUserTierAndUsage();

      const selectedVoiceName = availableVoices.find(v => v.voice_id === selectedVoice)?.name || 'Unknown Voice';
      await logAudioGeneration({
        title: storyTitle || 'Untitled',
        voice: selectedVoiceName,
        textLength: text.length
      });
    } catch (error: any) {
      console.error('Speech generation failed:', error);

      if (error.response && error.response.status === 403) {
        const data = await error.response.json();
        if (data.limitReached) {
          setGenerationCount(data.count || monthlyLimit);

          if (userTier === 'free') {
            alert(`You've reached your monthly limit of ${monthlyLimit} generations. Please upgrade to Labrish Pro for more generations.`);
            setShowUpgradePrompt(true);
          } else {
            alert(`You've reached your monthly limit of ${monthlyLimit} generations. Your limit will reset next month.`);
          }
        } else {
          alert(error.message || 'Failed to generate speech');
        }
      } else {
        alert(error.message || 'Failed to generate speech');
      }
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
    setCurrentTime(0);
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

  const handleFileProcessed = (result: FileUploadResult) => {
    setText(result.text);
    setShowFileUpload(false);
  };

  const handleFileError = (error: string) => {
    alert(error);
  };

  const handleSelectTemplate = (template: StoryTemplate) => {
    setText(template.content);
    setStoryTitle(template.title);
    setStoryCategory(template.category);
    setStoryTags(template.tags);
  };

  const handleSaveStory = async () => {
    if (!text.trim() || !storyTitle.trim()) {
      alert('Please provide both title and content for the story');
      return;
    }

    try {
      const storyData = {
        title: storyTitle,
        content: text,
        category: storyCategory,
        tags: storyTags,
        voice_id: selectedVoice,
        voice_settings: voiceSettings,
        audio_url: audioUrl || undefined,
        is_public: isPublic,
        duration: duration || undefined,
      };

      if (!isOnline) {
        // Queue the save request for when back online
        const requestId = offlineManager.queueRequest(
          '/api/save-story',
          'POST',
          { 'Content-Type': 'application/json' },
          JSON.stringify(storyData)
        );
        
        alert(`You're offline. Story save has been queued and will process when you're back online. (Queue ID: ${requestId})`);
        setShowSaveDialog(false);
        resetSaveForm();
        return;
      }

      if (editingStory) {
        alert('Story updated successfully!');
      } else {
        const savedStory = await saveStory(storyData);

        await logStoryCreated(savedStory?.id || '', {
          title: storyTitle,
          category: storyCategory,
          duration: duration
        });

        if (isPublic) {
          await logStoryShared(savedStory?.id || '', {
            title: storyTitle,
            category: storyCategory
          });
        }

        alert('Story saved successfully!');
      }

      setShowSaveDialog(false);
      resetSaveForm();
    } catch (error: any) {
      alert(`Failed to save story: ${error.message}`);
    }
  };

  const resetSaveForm = () => {
    setStoryTitle('');
    setStoryCategory('folklore');
    setStoryTags([]);
    setIsPublic(false);
    setEditingStory(null);
  };

  const handleEditStory = (story: Story) => {
    setText(story.content);
    setStoryTitle(story.title);
    setStoryCategory(story.category);
    setStoryTags(story.tags);
    setIsPublic(story.is_public);
    setSelectedVoice(story.voice_id);
    setVoiceSettings(story.voice_settings);
    setEditingStory(story);
    setActiveTab('create');
    
    if (story.audio_url) {
      // Clean up current audio URL before setting new one
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(story.audio_url);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !storyTags.includes(tag.trim())) {
      setStoryTags([...storyTags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setStoryTags(storyTags.filter(tag => tag !== tagToRemove));
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
        <div className="max-w-7xl mx-auto">
          {/* Header with Offline Status */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-4xl md:text-5xl text-gray-800 mb-4">
              <div className="flex items-center justify-center mb-2">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </div>
              Text-to-Speech Studio
            </h1>
            <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your text into authentic Caribbean voices with AI-powered speech synthesis
            </p>
            
            {/* Usage Status */}
            <div className="flex justify-center mt-4">
              <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                generationCount >= monthlyLimit
                  ? 'bg-red-100 text-red-800'
                  : generationCount >= monthlyLimit * 0.8
                  ? 'bg-yellow-100 text-yellow-800'
                  : userTier === 'pro'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {userTier === 'pro' && <Crown className="w-4 h-4" />}
                <span>
                  {userTier === 'pro' ? 'Labrish Pro' : 'Free Tier'}: {generationCount} / {monthlyLimit} generations used
                  {generationCount >= monthlyLimit && ' - Limit Reached'}
                  {generationCount >= monthlyLimit * 0.8 && generationCount < monthlyLimit && ' - Almost at limit!'}
                </span>
              </div>
            </div>
            
            {!isOnline && (
              <div className="mt-4 inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm">
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                Offline mode - {queueSize} actions queued
              </div>
            )}
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-emerald-200/50">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FileText className="w-4 h-4 mr-2 inline" />
                <span className="hidden sm:inline">Create Story</span>
                <span className="sm:hidden">Create</span>
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'library'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Book className="w-4 h-4 mr-2 inline" />
                <span className="hidden sm:inline">Story Library</span>
                <span className="sm:hidden">Library</span>
              </button>
            </div>
          </div>
          
          {/* Upgrade Prompt */}
          {((showUpgradePrompt || generationCount >= monthlyLimit * 0.8) && userTier === 'free') && (
            <motion.div
              className={`bg-gradient-to-r backdrop-blur-sm rounded-xl p-4 border max-w-4xl mx-auto mb-6 ${
                generationCount >= monthlyLimit
                  ? 'from-red-500/10 to-rose-500/10 border-red-300'
                  : 'from-purple-500/10 to-pink-500/10 border-purple-300'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  generationCount >= monthlyLimit ? 'bg-red-100' : 'bg-purple-100'
                }`}>
                  <Crown className={`w-6 h-6 ${
                    generationCount >= monthlyLimit ? 'text-red-600' : 'text-purple-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg text-gray-800 mb-1">
                    {generationCount >= monthlyLimit
                      ? 'Generation Limit Reached'
                      : 'Upgrade to Labrish Pro'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {generationCount >= monthlyLimit
                      ? `You've reached your monthly limit of ${monthlyLimit} generations. Upgrade to Labrish Pro for 40 generations per month.`
                      : `You've used ${generationCount} of your ${monthlyLimit} monthly generations. Upgrade to Labrish Pro for 40 generations per month.`}
                  </p>
                  {generationCount < monthlyLimit && (
                    <p className="text-xs text-gray-500 mt-1">
                      Your limit resets on the 1st of next month.
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white whitespace-nowrap"
                >
                  {generationCount >= monthlyLimit ? 'Upgrade to Continue' : 'Upgrade Now'}
                </Button>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'create' ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Text Input Section */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Text Input */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 border border-emerald-200/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-emerald-600" />
                          <h2 className="font-heading text-2xl text-gray-800">Your Text</h2>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowTemplateGallery(true)}
                            variant="outline"
                            size="sm"
                            className="self-start sm:self-auto"
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Use Template</span>
                            <span className="sm:hidden">Template</span>
                          </Button>
                          <Button
                            onClick={() => setShowFileUpload(!showFileUpload)}
                            variant="outline"
                            size="sm"
                            className="self-start sm:self-auto"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Upload File</span>
                            <span className="sm:hidden">Upload</span>
                          </Button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {showFileUpload && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                          >
                            <FileUploadZone
                              onFileProcessed={handleFileProcessed}
                              onError={handleFileError}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-6">
                        <div>
                          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
                            Enter your text (max 2,500 characters)
                          </label>
                          <textarea
                            id="text-input"
                            value={text}
                            onChange={(e) => setText(e.target.value.slice(0, 2500))}
                            className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                            placeholder="Enter the text you want to convert to speech. Try writing a Caribbean story or dialogue..."
                          />
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500">
                              {text.length}/2,500 characters
                            </span>
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

                        {/* AI-Powered Tools */}
                        <div className="space-y-4">
                          <StoryPromptGenerator
                            onSelectPrompt={(prompt) => setText(prompt)}
                          />

                          <DialectEnhancer
                            text={text}
                            onApplySuggestion={(original, replacement) => {
                              setText(text.replace(original, replacement));
                            }}
                          />

                          <StoryPolisher
                            text={text}
                            onApplyFix={(fix, location) => {
                              setText(text);
                            }}
                          />

                          <div className="grid md:grid-cols-2 gap-4">
                            <Button
                              onClick={() => setShowExpander(true)}
                              variant="outline"
                              disabled={!text.trim()}
                              className="w-full"
                            >
                              <Maximize2 className="w-4 h-4 mr-2" />
                              Expand Story
                            </Button>
                            <Button
                              onClick={() => setShowCulturalContext(!showCulturalContext)}
                              variant="outline"
                              className="w-full"
                            >
                              <Info className="w-4 h-4 mr-2" />
                              Cultural Info
                            </Button>
                          </div>

                          {showCulturalContext && (
                            <CulturalContextPanel onClose={() => setShowCulturalContext(false)} />
                          )}
                        </div>

                        {/* Generate Button */}
                        <Button
                          onClick={handleGenerateSpeech}
                          disabled={!text.trim() || isGenerating || generationCount >= monthlyLimit}
                          className={`w-full py-4 text-lg font-semibold transition-all ${
                            generationCount >= monthlyLimit
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                          } text-white`}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Generating Speech...
                            </>
                          ) : generationCount >= monthlyLimit ? (
                            <>
                              <Mic className="w-5 h-5 mr-2" />
                              Limit Reached - Upgrade to Continue
                            </>
                          ) : (
                            <>
                              <Mic className="w-5 h-5 mr-2" />
                              Generate Speech {!isOnline && '(Queued)'}
                            </>
                          )}
                        </Button>

                        <div className="flex flex-col items-center gap-2 mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                generationCount >= monthlyLimit
                                  ? 'bg-red-500'
                                  : generationCount >= monthlyLimit * 0.8
                                  ? 'bg-yellow-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min((generationCount / monthlyLimit) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm ${
                            generationCount >= monthlyLimit
                              ? 'text-red-600 font-medium'
                              : generationCount >= monthlyLimit * 0.8
                              ? 'text-yellow-700 font-medium'
                              : 'text-gray-500'
                          }`}>
                            {generationCount >= monthlyLimit
                              ? `Monthly limit reached (${generationCount}/${monthlyLimit})`
                              : generationCount >= monthlyLimit * 0.8
                              ? `Almost at limit: ${monthlyLimit - generationCount} generations remaining`
                              : `${monthlyLimit - generationCount} of ${monthlyLimit} generations remaining this month`
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Audio Player */}
                    {audioUrl && (
                      <EnhancedAudioPlayer
                        audioUrl={audioUrl}
                        audioBlob={audioBlob}
                        onDownload={handleDownload}
                        onSave={() => setShowSaveDialog(true)}
                        onShare={() => {}}
                      />
                    )}
                  </div>

                  {/* Voice Selection & Controls */}
                  <div className="space-y-6">
                    {/* Voice Selection */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-emerald-200/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading text-xl text-gray-800">Voice Selection</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSettings(!showSettings)}
                          aria-label={showSettings ? "Hide voice settings" : "Show voice settings"}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>

                      {voicesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {availableVoices.slice(0, 12).map((voice) => (
                            <div
                              key={voice.voice_id}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedVoice === voice.voice_id
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-gray-200 hover:border-emerald-300'
                              }`}
                              onClick={() => setSelectedVoice(voice.voice_id)}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-gray-800">{voice.name}</p>
                                      {voice.labels?.accent && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                          {voice.labels.accent}
                                        </span>
                                      )}
                                    </div>
                                    {voice.description && (
                                      <p className="text-sm text-gray-600 mt-1">{voice.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                      {voice.labels?.gender && (
                                        <span className="text-xs text-gray-500">
                                          {voice.labels.gender}
                                        </span>
                                      )}
                                      {voice.labels?.age && (
                                        <span className="text-xs text-gray-500">
                                          • {voice.labels.age}
                                        </span>
                                      )}
                                      {voice.category && (
                                        <span className="text-xs text-gray-500">
                                          • {voice.category}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {voice.preview_url && (
                                    <VoicePlayer
                                      url={voice.preview_url}
                                      name={voice.name}
                                      size="sm"
                                      variant={selectedVoice === voice.voice_id ? "default" : "outline"}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Voice Settings */}
                      <AnimatePresence>
                        {showSettings && (
                          <motion.div 
                            className="mt-6 pt-6 border-t border-gray-200 space-y-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h4 className="font-medium text-gray-800">Voice Settings</h4>
                            
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">
                                Stability: {voiceSettings.stability.toFixed(1)}
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
                                aria-label="Stability setting"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 mb-2">
                                Clarity: {voiceSettings.similarity_boost.toFixed(1)}
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
                                aria-label="Clarity setting"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 mb-2">
                                Style: {voiceSettings.style.toFixed(1)}
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
                                aria-label="Style setting"
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
                                aria-label="Speaker boost"
                              />
                              <label htmlFor="speaker-boost" className="text-sm text-gray-600">
                                Speaker Boost
                              </label>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="library"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StoryLibrary
                  onCreateNew={() => setActiveTab('create')}
                  onEditStory={handleEditStory}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Story Dialog */}
          <AnimatePresence>
            {showSaveDialog && (
              <motion.div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <h3 className="font-heading text-2xl text-gray-800 mb-6">
                    {editingStory ? 'Update Story' : 'Save Story'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Story Title
                      </label>
                      <input
                        type="text"
                        value={storyTitle}
                        onChange={(e) => setStoryTitle(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter story title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={storyCategory}
                        onChange={(e) => setStoryCategory(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {STORY_CATEGORIES.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (press Enter to add)
                      </label>
                      <input
                        type="text"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTag(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Add tags..."
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {storyTags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="text-emerald-500 hover:text-emerald-700"
                              aria-label={`Remove tag ${tag}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is-public"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="is-public" className="text-sm text-gray-600">
                        Make this story public
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <Button
                      onClick={() => setShowSaveDialog(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveStory}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    >
                      {editingStory ? 'Update' : 'Save'} Story {!isOnline && '(Queued)'}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Story Template Gallery */}
          <AnimatePresence>
            {showTemplateGallery && (
              <StoryTemplateGallery
                onSelectTemplate={handleSelectTemplate}
                onClose={() => setShowTemplateGallery(false)}
              />
            )}

            {showExpander && (
              <StoryExpander
                originalText={text}
                onAcceptExpansion={(expandedText) => {
                  setText(expandedText);
                  setShowExpander(false);
                }}
                onCancel={() => setShowExpander(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechPage;
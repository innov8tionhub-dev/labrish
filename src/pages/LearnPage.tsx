import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Play, Pause, SkipBack, SkipForward, Volume2, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { getCulturalContext } from '@/lib/aiAssistant';

interface LearnPageProps {}

export const LearnPage: React.FC<LearnPageProps> = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [highlightedWord, setHighlightedWord] = useState<string>('');
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [wordDefinition, setWordDefinition] = useState<any>(null);
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (storyId && user) {
      loadStory();
      loadVocabulary();
      loadProgress();
    }
  }, [storyId, user]);

  const loadStory = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .maybeSingle();

      if (error) throw error;
      setStory(data);
    } catch (error) {
      console.error('Failed to load story:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVocabulary = async () => {
    try {
      const { data } = await supabase
        .from('learning_vocabulary')
        .select('*')
        .eq('user_id', user.id)
        .eq('story_id', storyId);

      setVocabulary(data || []);
    } catch (error) {
      console.error('Failed to load vocabulary:', error);
    }
  };

  const loadProgress = async () => {
    try {
      const { data } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('story_id', storyId)
        .maybeSingle();

      setProgress(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);

      updateProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const updateProgress = async (time: number) => {
    if (!user || !storyId) return;

    try {
      await supabase.from('learning_progress').upsert({
        user_id: user.id,
        story_id: storyId,
        time_spent_seconds: Math.floor(time),
        last_accessed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  };

  const handleWordClick = async (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
    setSelectedWord(cleanWord);

    const response = await getCulturalContext(cleanWord);
    if (response.success && response.context) {
      setWordDefinition(response.context);
    } else {
      setWordDefinition({
        term: cleanWord,
        definition: 'Click "Add to Vocabulary" to save this word for later review.',
        cultural_significance: '',
        related_terms: [],
      });
    }
  };

  const addToVocabulary = async () => {
    if (!user || !selectedWord) return;

    try {
      await supabase.from('learning_vocabulary').insert({
        user_id: user.id,
        word: selectedWord,
        definition: wordDefinition?.definition || '',
        example_sentence: getExampleSentence(selectedWord),
        story_id: storyId,
        mastery_level: 0,
      });

      loadVocabulary();
      alert('Added to vocabulary!');
    } catch (error) {
      console.error('Failed to add to vocabulary:', error);
    }
  };

  const getExampleSentence = (word: string): string => {
    const content = story?.content || '';
    const sentences = content.split(/[.!?]+/);

    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(word.toLowerCase())) {
        return sentence.trim();
      }
    }
    return '';
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderTranscript = () => {
    if (!story?.content) return null;

    const words = story.content.split(/\s+/);
    const wordsPerSecond = words.length / (duration || 1);
    const currentWordIndex = Math.floor(currentTime * wordsPerSecond);

    return words.map((word, index) => {
      const isCurrentWord = index === currentWordIndex;
      const isPastWord = index < currentWordIndex;
      const isVocabWord = vocabulary.some(v => word.toLowerCase().includes(v.word.toLowerCase()));

      return (
        <span
          key={index}
          onClick={() => handleWordClick(word)}
          className={`cursor-pointer transition-all ${
            isCurrentWord
              ? 'bg-yellow-300 text-gray-900 font-bold px-1 rounded'
              : isPastWord
              ? 'text-gray-600'
              : 'text-gray-800 hover:bg-gray-100'
          } ${isVocabWord ? 'underline decoration-emerald-500' : ''}`}
        >
          {word}{' '}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Story not found</p>
          <Button onClick={() => navigate('/discover')} className="mt-4">
            Browse Stories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/discover')}
            variant="ghost"
            size="sm"
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Discovery
          </Button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="font-heading text-3xl text-gray-800 mb-2">{story.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                    {story.category}
                  </span>
                  <span>{vocabulary.length} words learned</span>
                  {progress && (
                    <span>{Math.floor(progress.time_spent_seconds / 60)} min studied</span>
                  )}
                </div>
              </div>
              <BookOpen className="w-8 h-8 text-emerald-600" />
            </div>

            {story.audio_url && (
              <div className="mb-6">
                <audio
                  ref={audioRef}
                  src={story.audio_url}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={skipBackward}
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>

                    <Button
                      onClick={togglePlay}
                      size="lg"
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6 ml-1" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={skipForward}
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>

                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = parseFloat(e.target.value);
                          }
                        }}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-gray-600" />
                    <div className="flex gap-2">
                      {[0.5, 0.75, 1.0, 1.25, 1.5].map((rate) => (
                        <Button
                          key={rate}
                          size="sm"
                          variant={playbackRate === rate ? 'default' : 'outline'}
                          onClick={() => changePlaybackRate(rate)}
                          className={playbackRate === rate ? 'bg-emerald-600' : ''}
                        >
                          {rate}x
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="font-heading text-xl text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  Interactive Transcript
                </h2>
                <div
                  ref={transcriptRef}
                  className="bg-gray-50 rounded-lg p-6 text-lg leading-relaxed h-[400px] overflow-y-auto"
                >
                  {renderTranscript()}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click any word to see its definition and add it to your vocabulary
                </p>
              </div>

              <div>
                {wordDefinition && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6"
                  >
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-2xl">{selectedWord}</span>
                      {wordDefinition.pronunciation && (
                        <span className="text-sm text-gray-600">({wordDefinition.pronunciation})</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">{wordDefinition.definition}</p>
                    {wordDefinition.cultural_significance && (
                      <p className="text-xs text-gray-600 mb-3">{wordDefinition.cultural_significance}</p>
                    )}
                    <Button
                      size="sm"
                      onClick={addToVocabulary}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Star className="w-3 h-3 mr-2" />
                      Add to Vocabulary
                    </Button>
                  </motion.div>
                )}

                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Your Vocabulary ({vocabulary.length})</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {vocabulary.map((vocab) => (
                      <div
                        key={vocab.id}
                        className="bg-emerald-50 rounded p-3 border border-emerald-200"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800">{vocab.word}</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < vocab.mastery_level ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">{vocab.definition}</p>
                      </div>
                    ))}

                    {vocabulary.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Click words in the transcript to add them here
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnPage;

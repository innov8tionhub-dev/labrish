import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Upload, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Volume2,
  Waveform,
  Settings,
  Save,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProgressBar from '@/components/common/ProgressBar';
import { useToast } from '@/components/common/Toast';
import { useAnalytics } from '@/lib/analytics';

interface VoiceCloneProject {
  id: string;
  name: string;
  status: 'recording' | 'processing' | 'training' | 'completed' | 'failed';
  progress: number;
  audioSamples: AudioSample[];
  qualityScore?: number;
  estimatedCompletion?: string;
  createdAt: string;
  lastModified: string;
}

interface AudioSample {
  id: string;
  blob: Blob;
  duration: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  transcript?: string;
  waveformData?: number[];
}

interface VoiceSettings {
  stability: number;
  similarity: number;
  style: number;
  speakerBoost: boolean;
}

const VoiceCloningStudio: React.FC = () => {
  const [currentProject, setCurrentProject] = useState<VoiceCloneProject | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    stability: 0.75,
    similarity: 0.85,
    style: 0.2,
    speakerBoost: true
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  const { track } = useAnalytics();

  const requiredPhrases = [
    "Hello, my name is [Your Name] and I'm creating a voice clone for Labrish.",
    "The quick brown fox jumps over the lazy dog.",
    "Caribbean culture is rich with storytelling traditions.",
    "I love the sound of steel drums and calypso music.",
    "The sunset over the Caribbean sea is absolutely breathtaking.",
    "Anansi the spider is a beloved character in our folklore.",
    "Welcome to our beautiful island paradise.",
    "The rhythm of reggae music fills the air.",
    "Coconut water is refreshing on a hot summer day.",
    "Our ancestors passed down wisdom through oral traditions."
  ];

  const startNewProject = () => {
    const project: VoiceCloneProject = {
      id: crypto.randomUUID(),
      name: `Voice Clone ${new Date().toLocaleDateString()}`,
      status: 'recording',
      progress: 0,
      audioSamples: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    setCurrentProject(project);
    track('voice_clone_project_started');
    showInfo('New voice cloning project started', 'Record at least 30 seconds of clear audio');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      setAudioStream(stream);
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        addAudioSample(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      track('voice_recording_started');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      showError('Recording failed', 'Please check your microphone permissions');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      track('voice_recording_stopped', { duration: recordingTime });
    }
  };

  const addAudioSample = (blob: Blob) => {
    if (!currentProject) return;
    
    const audio = new Audio(URL.createObjectURL(blob));
    audio.addEventListener('loadedmetadata', () => {
      const sample: AudioSample = {
        id: crypto.randomUUID(),
        blob,
        duration: audio.duration,
        quality: assessAudioQuality(audio.duration),
        waveformData: generateMockWaveform()
      };
      
      setCurrentProject(prev => prev ? {
        ...prev,
        audioSamples: [...prev.audioSamples, sample],
        lastModified: new Date().toISOString(),
        progress: Math.min((prev.audioSamples.length + 1) * 10, 100)
      } : null);
      
      showSuccess('Audio sample added', `Duration: ${formatDuration(audio.duration)}`);
    });
  };

  const assessAudioQuality = (duration: number): AudioSample['quality'] => {
    if (duration < 5) return 'poor';
    if (duration < 15) return 'fair';
    if (duration < 30) return 'good';
    return 'excellent';
  };

  const generateMockWaveform = (): number[] => {
    return Array.from({ length: 100 }, () => Math.random() * 100);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !currentProject) return;
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('audio/')) {
        const blob = new Blob([file], { type: file.type });
        addAudioSample(blob);
        track('voice_sample_uploaded', { file_type: file.type, file_size: file.size });
      }
    });
  };

  const playAudioSample = (sample: AudioSample) => {
    if (isPlaying === sample.id) {
      // Stop playing
      setIsPlaying(null);
    } else {
      // Start playing
      const audio = new Audio(URL.createObjectURL(sample.blob));
      audio.addEventListener('ended', () => setIsPlaying(null));
      audio.play();
      setIsPlaying(sample.id);
    }
  };

  const deleteSample = (sampleId: string) => {
    if (!currentProject) return;
    
    setCurrentProject(prev => prev ? {
      ...prev,
      audioSamples: prev.audioSamples.filter(s => s.id !== sampleId),
      lastModified: new Date().toISOString()
    } : null);
    
    showInfo('Sample deleted');
  };

  const startTraining = async () => {
    if (!currentProject || currentProject.audioSamples.length === 0) {
      showError('No audio samples', 'Please record or upload audio samples first');
      return;
    }
    
    const totalDuration = currentProject.audioSamples.reduce((sum, sample) => sum + sample.duration, 0);
    
    if (totalDuration < 30) {
      showError('Insufficient audio', 'Please provide at least 30 seconds of audio');
      return;
    }
    
    setCurrentProject(prev => prev ? {
      ...prev,
      status: 'training',
      progress: 0,
      estimatedCompletion: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    } : null);
    
    track('voice_training_started', { 
      sample_count: currentProject.audioSamples.length,
      total_duration: totalDuration 
    });
    
    // Simulate training progress
    const progressInterval = setInterval(() => {
      setCurrentProject(prev => {
        if (!prev || prev.status !== 'training') {
          clearInterval(progressInterval);
          return prev;
        }
        
        const newProgress = Math.min(prev.progress + Math.random() * 10, 100);
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          showSuccess('Voice training completed!', 'Your voice clone is ready to use');
          track('voice_training_completed');
          
          return {
            ...prev,
            status: 'completed',
            progress: 100,
            qualityScore: 85 + Math.random() * 10 // 85-95%
          };
        }
        
        return { ...prev, progress: newProgress };
      });
    }, 1000);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality: AudioSample['quality']) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
    }
  };

  const getTotalDuration = () => {
    if (!currentProject) return 0;
    return currentProject.audioSamples.reduce((sum, sample) => sum + sample.duration, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-200/50 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-4xl text-gray-800 mb-2">Voice Cloning Studio</h1>
              <p className="text-gray-600">Create your personalized AI voice with advanced cloning technology</p>
            </div>
            
            {!currentProject && (
              <Button
                onClick={startNewProject}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Project
              </Button>
            )}
          </div>
        </motion.div>

        {!currentProject ? (
          /* Getting Started */
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Mic className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
            <h2 className="font-heading text-2xl text-gray-800 mb-4">Create Your Voice Clone</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Train an AI model with your voice to create authentic Caribbean storytelling experiences. 
              You'll need to provide at least 30 seconds of clear audio recordings.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-emerald-50 rounded-lg">
                <Mic className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Record Audio</h3>
                <p className="text-sm text-gray-600">Use your microphone to record clear speech samples</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-lg">
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Upload Files</h3>
                <p className="text-sm text-gray-600">Upload existing audio files in MP3, WAV, or M4A format</p>
              </div>
              <div className="p-6 bg-purple-50 rounded-lg">
                <Settings className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Train Model</h3>
                <p className="text-sm text-gray-600">AI processes your voice to create a personalized model</p>
              </div>
            </div>
            
            <Button
              onClick={startNewProject}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              Get Started
            </Button>
          </motion.div>
        ) : (
          /* Project Interface */
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recording Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Status */}
              <motion.div 
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl text-gray-800">{currentProject.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentProject.status === 'completed' ? 'bg-green-100 text-green-700' :
                      currentProject.status === 'training' ? 'bg-blue-100 text-blue-700' :
                      currentProject.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {currentProject.status.charAt(0).toUpperCase() + currentProject.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                {currentProject.status === 'training' && (
                  <div className="mb-4">
                    <ProgressBar 
                      progress={currentProject.progress} 
                      label="Training Progress"
                      color="emerald"
                      animated
                    />
                    {currentProject.estimatedCompletion && (
                      <p className="text-sm text-gray-600 mt-2">
                        Estimated completion: {new Date(currentProject.estimatedCompletion).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                )}
                
                {currentProject.status === 'completed' && currentProject.qualityScore && (
                  <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Training Completed</span>
                    </div>
                    <p className="text-green-700">
                      Quality Score: {currentProject.qualityScore.toFixed(1)}% - Your voice clone is ready!
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">{currentProject.audioSamples.length}</div>
                    <div className="text-sm text-gray-600">Samples</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{formatDuration(getTotalDuration())}</div>
                    <div className="text-sm text-gray-600">Total Duration</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{currentProject.progress}%</div>
                    <div className="text-sm text-gray-600">Progress</div>
                  </div>
                </div>
              </motion.div>

              {/* Recording Interface */}
              {currentProject.status === 'recording' && (
                <motion.div 
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="font-heading text-lg text-gray-800 mb-4">Record Audio Samples</h3>
                  
                  <div className="text-center mb-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      isRecording ? 'bg-red-100 animate-pulse' : 'bg-emerald-100'
                    }`}>
                      <Mic className={`w-12 h-12 ${isRecording ? 'text-red-600' : 'text-emerald-600'}`} />
                    </div>
                    
                    {isRecording && (
                      <div className="text-2xl font-bold text-red-600 mb-2">
                        {formatDuration(recordingTime)}
                      </div>
                    )}
                    
                    <div className="flex justify-center gap-4">
                      {!isRecording ? (
                        <Button
                          onClick={startRecording}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        >
                          <Mic className="w-4 h-4 mr-2" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button
                          onClick={stopRecording}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          Stop Recording
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        disabled={isRecording}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Suggested Phrases */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">Suggested Phrases to Record:</h4>
                    <div className="grid gap-2 text-sm">
                      {requiredPhrases.slice(0, 3).map((phrase, index) => (
                        <div key={index} className="p-2 bg-white rounded border">
                          "{phrase}"
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Record these phrases for optimal voice quality. Speak clearly and naturally.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Audio Samples List */}
              {currentProject.audioSamples.length > 0 && (
                <motion.div 
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h3 className="font-heading text-lg text-gray-800 mb-4">Audio Samples</h3>
                  
                  <div className="space-y-3">
                    {currentProject.audioSamples.map((sample, index) => (
                      <div key={sample.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">
                              Sample {index + 1}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(sample.quality)}`}>
                              {sample.quality}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Duration: {formatDuration(sample.duration)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => playAudioSample(sample)}
                            size="sm"
                            variant="outline"
                          >
                            {isPlaying === sample.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            onClick={() => deleteSample(sample.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Voice Settings */}
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-lg text-gray-800">Voice Settings</h3>
                  <Button
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stability: {voiceSettings.stability.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={voiceSettings.stability}
                      onChange={(e) => setVoiceSettings(prev => ({
                        ...prev,
                        stability: parseFloat(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Similarity: {voiceSettings.similarity.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={voiceSettings.similarity}
                      onChange={(e) => setVoiceSettings(prev => ({
                        ...prev,
                        similarity: parseFloat(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>
                  
                  <AnimatePresence>
                    {showAdvancedSettings && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Style: {voiceSettings.style.toFixed(2)}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
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
                            checked={voiceSettings.speakerBoost}
                            onChange={(e) => setVoiceSettings(prev => ({
                              ...prev,
                              speakerBoost: e.target.checked
                            }))}
                            className="rounded"
                          />
                          <label htmlFor="speaker-boost" className="text-sm text-gray-700">
                            Speaker Boost
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Training Controls */}
              {currentProject.status === 'recording' && currentProject.audioSamples.length > 0 && (
                <motion.div 
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h3 className="font-heading text-lg text-gray-800 mb-4">Ready to Train?</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Requirements Check</span>
                      </div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li className={getTotalDuration() >= 30 ? 'text-green-700' : 'text-red-700'}>
                          ✓ Minimum 30 seconds of audio {getTotalDuration() >= 30 ? '(Met)' : '(Need more)'}
                        </li>
                        <li className={currentProject.audioSamples.length >= 3 ? 'text-green-700' : 'text-yellow-700'}>
                          ✓ Multiple samples recommended {currentProject.audioSamples.length >= 3 ? '(Met)' : '(Optional)'}
                        </li>
                      </ul>
                    </div>
                    
                    <Button
                      onClick={startTraining}
                      disabled={getTotalDuration() < 30}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Start Training
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Export Options */}
              {currentProject.status === 'completed' && (
                <motion.div 
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h3 className="font-heading text-lg text-gray-800 mb-4">Export & Use</h3>
                  
                  <div className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Save to Voice Library
                    </Button>
                    
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Model
                    </Button>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      onClick={() => {
                        track('voice_clone_used_in_tts');
                        // Navigate to TTS with this voice selected
                      }}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Use in TTS Studio
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceCloningStudio;
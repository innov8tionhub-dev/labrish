import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  RotateCcw, 
  Upload, 
  Loader2, 
  Wand2, 
  Headphones, 
  Save, 
  Download, 
  Star,
  VolumeX,
  ChevronLeft,
  CheckCircle,
  Settings,
  AlertCircle,
  Type,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/common/Toast';
import { useAnalytics } from '@/lib/analytics';
import { useNavigate } from 'react-router-dom';
import VoicePlayer from '@/components/VoicePlayer';

interface VoiceDesignState {
  loading: boolean;
  error: string | null;
  generatedVoiceId: string | null;
  previewUrl: string | null;
  isGeneratingPreview: boolean;
}

const VoiceDesignStudio: React.FC = () => {
  const [voiceDescription, setVoiceDescription] = useState('');
  const [voiceName, setVoiceName] = useState('My Caribbean Voice');
  const [previewText, setPreviewText] = useState('Welcome to our Caribbean storytelling platform. My name is Maria, and I am excited to share stories with you today.');
  const [voiceState, setVoiceState] = useState<VoiceDesignState>({
    loading: false,
    error: null,
    generatedVoiceId: null,
    previewUrl: null,
    isGeneratingPreview: false
  });
  const [referenceAudio, setReferenceAudio] = useState<File | null>(null);
  const [referenceAudioWeight, setReferenceAudioWeight] = useState(0.5);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessView, setShowSuccessView] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Advanced settings
  const [seed, setSeed] = useState(42);
  const [loudness, setLoudness] = useState(1);
  const [guidanceScale, setGuidanceScale] = useState(1.5);
  const [autoGenerateText, setAutoGenerateText] = useState(true);
  const [customText, setCustomText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { track } = useAnalytics();
  
  const descriptionPlaceholders = [
    'A warm Jamaican accent with a rich, melodious tone',
    'A gentle Trinidadian voice with a relaxed, rhythmic cadence',
    'A vibrant Barbadian accent with an enthusiastic, upbeat quality',
    'A wise elder from St. Lucia with a soothing, storytelling voice',
    'A poetic Caribbean voice with a deep, resonant timbre',
  ];
  
  const generatePlaceholder = () => {
    const index = Math.floor(Math.random() * descriptionPlaceholders.length);
    return descriptionPlaceholders[index];
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('audio/')) {
        error('Invalid file type', 'Please upload an audio file (MP3, WAV, etc.)');
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        error('File too large', 'Reference audio must be less than 5MB');
        return;
      }
      
      setReferenceAudio(file);
      track('voice_design_reference_uploaded', { file_type: file.type, file_size: file.size });
    }
  };
  
  const handleRemoveReferenceAudio = () => {
    setReferenceAudio(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000));
  };

  const generatePreviewAudio = async (voiceId: string): Promise<string | null> => {
    try {
      setVoiceState(prev => ({ ...prev, isGeneratingPreview: true }));
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('User not authenticated');
      }

      const textToSpeak = autoGenerateText ? previewText : (customText || previewText);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          text: textToSpeak,
          voice_id: voiceId,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return audioUrl;
    } catch (err) {
      console.error('Preview generation error:', err);
      return null;
    } finally {
      setVoiceState(prev => ({ ...prev, isGeneratingPreview: false }));
    }
  };

  const handleGenerateVoice = async () => {
    if (!voiceDescription.trim()) {
      error('Voice description required', 'Please enter a description of the voice you want to generate');
      return;
    }
    
    setVoiceState({
      loading: true,
      error: null,
      generatedVoiceId: null,
      previewUrl: null,
      isGeneratingPreview: false
    });
    
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('User not authenticated');
      }
      
      // Prepare the request body
      const requestBody: Record<string, any> = {
        voiceDescription: voiceDescription,
        name: voiceName || 'My Caribbean Voice',
        model_id: 'eleven_monolingual_v1',
        loudness,
        seed,
        guidance_scale: guidanceScale,
      };

      // Only include text if auto_generate_text is false
      if (!autoGenerateText) {
        requestBody.auto_generate_text = false;
        requestBody.text = customText || previewText;
      } else {
        requestBody.auto_generate_text = true;
      }
      
      // If reference audio is provided, convert it to base64
      if (referenceAudio) {
        const fileReader = new FileReader();
        const audioBase64 = await new Promise<string>((resolve, reject) => {
          fileReader.onload = () => {
            const base64 = fileReader.result as string;
            // Extract the base64 data part (remove the prefix)
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
          };
          fileReader.onerror = reject;
          fileReader.readAsDataURL(referenceAudio);
        });
        
        requestBody.reference_audio = audioBase64;
        requestBody.reference_audio_weight = referenceAudioWeight;
      }
      
      // Call Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-voice-design`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate voice');
      }
      
      const data = await response.json();
      
      if (!data.voice_id) {
        throw new Error('No voice ID was returned from the API');
      }
      
      // Generate actual preview audio using the new voice
      const previewUrl = await generatePreviewAudio(data.voice_id);
      
      setVoiceState({
        loading: false,
        error: null,
        generatedVoiceId: data.voice_id,
        previewUrl,
        isGeneratingPreview: false
      });
      
      success('Voice generated successfully!', `Voice ID: ${data.voice_id}`);
      setShowSuccessView(true);
      track('voice_design_generated', { description_length: voiceDescription.length });
    } catch (err: any) {
      console.error('Voice generation error:', err);
      setVoiceState({
        loading: false,
        error: err.message || 'Failed to generate voice',
        generatedVoiceId: null,
        previewUrl: null,
        isGeneratingPreview: false
      });
      error('Voice generation failed', err.message || 'Please try again with a different description');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegeneratePreview = async () => {
    if (!voiceState.generatedVoiceId) return;
    
    const newPreviewUrl = await generatePreviewAudio(voiceState.generatedVoiceId);
    if (newPreviewUrl) {
      setVoiceState(prev => ({ ...prev, previewUrl: newPreviewUrl }));
      success('Preview regenerated', 'New audio preview created');
    } else {
      error('Failed to regenerate preview', 'Please try again');
    }
  };
  
  const handleSaveVoice = async () => {
    if (!voiceState.generatedVoiceId) return;
    
    setIsSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const voiceSettings = {
        seed,
        loudness,
        guidance_scale: guidanceScale,
        reference_audio_weight: referenceAudioWeight,
        model_id: 'eleven_monolingual_v1'
      };

      const { error: insertError } = await supabase
        .from('custom_voices')
        .insert({
          user_id: session.user.id,
          voice_id: voiceState.generatedVoiceId,
          name: voiceName,
          description: voiceDescription,
          voice_settings: voiceSettings,
          preview_url: voiceState.previewUrl
        });

      if (insertError) {
        throw insertError;
      }

      success('Voice saved successfully!', 'You can now use this voice for your stories');
      track('voice_design_saved', { voice_id: voiceState.generatedVoiceId });
    } catch (err: any) {
      console.error('Save voice error:', err);
      error('Failed to save voice', err.message || 'Please try again');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-200/50 mb-8 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back Button */}
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="ghost" 
              size="sm" 
              className="absolute left-4 top-4 md:left-8 md:top-8"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center justify-center md:justify-between flex-wrap gap-4 pt-10 md:pt-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="font-heading text-4xl text-gray-800 mb-2 text-center md:text-left">Voice Design Studio</h1>
                  <p className="text-gray-600 text-center md:text-left">Create custom voices with AI-powered voice design</p>
                </div>
              </div>
            </div>
          </motion.div>

          {showSuccessView ? (
            <SuccessView 
              voiceId={voiceState.generatedVoiceId!}
              previewUrl={voiceState.previewUrl}
              voiceName={voiceName}
              description={voiceDescription}
              previewText={autoGenerateText ? previewText : (customText || previewText)}
              onSave={handleSaveVoice}
              onRegeneratePreview={handleRegeneratePreview}
              onReset={() => {
                setShowSuccessView(false);
                setVoiceState({
                  loading: false,
                  error: null,
                  generatedVoiceId: null,
                  previewUrl: null,
                  isGeneratingPreview: false
                });
              }}
              isSaving={isSaving}
              isRegenerating={voiceState.isGeneratingPreview}
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Main Content */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {/* Voice Description */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
                  <h2 className="font-heading text-2xl text-gray-800 mb-6">Describe Your Voice</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="voice-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Voice Name
                      </label>
                      <input
                        id="voice-name"
                        type="text"
                        value={voiceName}
                        onChange={(e) => setVoiceName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="My Caribbean Voice"
                        maxLength={50}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="voice-description" className="block text-sm font-medium text-gray-700 mb-2">
                        Voice Description
                      </label>
                      <textarea
                        id="voice-description"
                        value={voiceDescription}
                        onChange={(e) => setVoiceDescription(e.target.value)}
                        className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        placeholder={generatePlaceholder()}
                        maxLength={500}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>{voiceDescription.length}/500 characters</span>
                        <button 
                          onClick={() => setVoiceDescription(generatePlaceholder())}
                          className="text-purple-500 hover:text-purple-700"
                        >
                          Use example
                        </button>
                      </div>
                    </div>

                    {/* Preview Text */}
                    <div>
                      <label htmlFor="preview-text" className="block text-sm font-medium text-gray-700 mb-2">
                        <Type className="w-4 h-4 inline mr-2" />
                        Preview Text (what the voice will say)
                      </label>
                      <textarea
                        id="preview-text"
                        value={previewText}
                        onChange={(e) => setPreviewText(e.target.value)}
                        className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        placeholder="Enter the text you want the voice to speak in the preview..."
                        maxLength={500}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {previewText.length}/500 characters
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-800">Reference Audio (Optional)</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileChange}
                          accept="audio/*"
                          className="hidden"
                        />
                      </div>
                      
                      {referenceAudio ? (
                        <div className="p-4 bg-purple-50 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{referenceAudio.name}</p>
                            <p className="text-sm text-gray-600">
                              {(referenceAudio.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleRemoveReferenceAudio}
                          >
                            <VolumeX className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <p className="text-sm text-gray-600">
                            Upload a reference audio file to influence the generated voice
                          </p>
                        </div>
                      )}
                      
                      {referenceAudio && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reference Weight: {referenceAudioWeight.toFixed(1)}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={referenceAudioWeight}
                            onChange={(e) => setReferenceAudioWeight(parseFloat(e.target.value))}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Higher values make the output sound more like the reference audio
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      {showAdvancedSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                    </Button>
                  </div>
                </div>
                
                {/* Advanced Settings */}
                <AnimatePresence>
                  {showAdvancedSettings && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6 overflow-hidden"
                    >
                      <h2 className="font-heading text-xl text-gray-800 mb-6">Advanced Settings</h2>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Seed: {seed}
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={seed}
                                onChange={(e) => setSeed(parseInt(e.target.value))}
                                min="0"
                                max="4294967295"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                              />
                              <Button 
                                onClick={generateRandomSeed}
                                variant="outline"
                                size="sm"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Controls randomness. Same seed will generate the same voice.
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loudness: {loudness.toFixed(1)}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="2"
                            step="0.1"
                            value={loudness}
                            onChange={(e) => setLoudness(parseFloat(e.target.value))}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Controls the overall volume of the voice
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Guidance Scale: {guidanceScale.toFixed(1)}
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={guidanceScale}
                            onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            How closely the voice follows your description
                          </p>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <input
                              id="auto-generate-text"
                              type="checkbox"
                              checked={autoGenerateText}
                              onChange={(e) => setAutoGenerateText(e.target.checked)}
                              className="rounded"
                            />
                            <label htmlFor="auto-generate-text" className="text-sm text-gray-700">
                              Auto-generate sample text
                            </label>
                          </div>
                          
                          {!autoGenerateText && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Custom Sample Text
                              </label>
                              <textarea
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                placeholder="Enter text for the voice to say in the preview..."
                                maxLength={500}
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                {customText.length}/500 characters
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Information Panel */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* About Voice Design */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    <h2 className="font-heading text-2xl text-gray-800">AI Voice Design</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Create custom voices using AI-powered voice design technology. Just describe the voice you want, and our system will generate it for you.
                    </p>
                    
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <h3 className="font-medium text-purple-800 mb-2">Tips for great results:</h3>
                      <ul className="space-y-2 text-sm text-purple-700">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 font-bold">•</span>
                          <span>Be specific about accent, tone, age, and gender</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 font-bold">•</span>
                          <span>Include details about emotion and speaking style</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 font-bold">•</span>
                          <span>Mention specific Caribbean dialects if desired</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 font-bold">•</span>
                          <span>Upload a reference audio for more control</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">Examples:</h3>
                      <div className="space-y-3">
                        {descriptionPlaceholders.map((example, index) => (
                          <div
                            key={index}
                            className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 cursor-pointer transition-colors"
                            onClick={() => setVoiceDescription(example)}
                          >
                            "{example}"
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Generation Button */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
                  <Button
                    onClick={handleGenerateVoice}
                    disabled={isSubmitting || !voiceDescription.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-16 text-lg font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Voice...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Generate Voice
                      </>
                    )}
                  </Button>
                  
                  {voiceState.error && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{voiceState.error}</span>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Generation typically takes about 20-30 seconds
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SuccessViewProps {
  voiceId: string;
  previewUrl: string | null;
  voiceName: string;
  description: string;
  previewText: string;
  onSave: () => void;
  onRegeneratePreview: () => void;
  onReset: () => void;
  isSaving: boolean;
  isRegenerating: boolean;
}

const SuccessView: React.FC<SuccessViewProps> = ({ 
  voiceId, 
  previewUrl, 
  voiceName, 
  description,
  previewText,
  onSave,
  onRegeneratePreview,
  onReset,
  isSaving,
  isRegenerating
}) => {
  return (
    <motion.div 
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="font-heading text-3xl text-gray-800 mb-2">Voice Generated Successfully!</h2>
        <p className="text-gray-600">Your new voice is ready to use</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-heading text-xl text-gray-800 mb-4">Voice Details</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Voice Name</p>
              <p className="font-medium text-gray-800">{voiceName}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Voice ID</p>
              <p className="font-mono text-sm text-gray-800 break-all">{voiceId}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-gray-800">{description}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Preview Text</p>
              <p className="text-gray-800 italic">"{previewText}"</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-heading text-xl text-gray-800 mb-4">Voice Preview</h3>
          <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Headphones className="w-8 h-8 text-purple-600" />
              </div>
              
              {previewUrl && (
                <VoicePlayer 
                  url={previewUrl} 
                  name={voiceName} 
                  size="lg"
                  variant="default"
                />
              )}
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-purple-700">
                Listen to your generated voice
              </p>
              <Button
                onClick={onRegeneratePreview}
                disabled={isRegenerating}
                variant="outline"
                size="sm"
                className="text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Regenerate Preview
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save to My Voices
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => window.open(`https://api.elevenlabs.io/v1/voices/${voiceId}/stream`, '_blank')}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Voice
        </Button>
        
        <Button
          variant="ghost"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Create Another Voice
        </Button>
      </div>
    </motion.div>
  );
};

export default VoiceDesignStudio;
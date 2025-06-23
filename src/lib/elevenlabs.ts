import { supabase } from './supabase';

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  available_for_tiers?: string[];
  settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface TTSRequest {
  text: string;
  voice_id: string;
  voice_settings: VoiceSettings;
}

export interface TTSResponse {
  audio: Blob;
}

/**
 * Generate speech from text using Eleven Labs API via Supabase Edge Function
 */
export const generateSpeech = async (
  text: string,
  voiceId: string,
  voiceSettings: VoiceSettings
): Promise<Blob> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      text,
      voice_id: voiceId,
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate speech' }));
    throw new Error(error.error || 'Failed to generate speech');
  }

  return response.blob();
};

/**
 * Get available voices from Eleven Labs API via Supabase Edge Function
 */
export const getAvailableVoices = async (): Promise<Voice[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-voices`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch voices' }));
    throw new Error(error.error || 'Failed to fetch voices');
  }

  const data = await response.json();
  return data.voices || [];
};

/**
 * Get voice details by ID
 */
export const getVoiceById = async (voiceId: string): Promise<Voice | null> => {
  try {
    const voices = await getAvailableVoices();
    return voices.find(voice => voice.voice_id === voiceId) || null;
  } catch (error) {
    console.error('Failed to get voice by ID:', error);
    return null;
  }
};

/**
 * Validate text length for TTS
 */
export const validateTextLength = (text: string): { valid: boolean; message?: string } => {
  if (text.length === 0) {
    return { valid: false, message: 'Text cannot be empty' };
  }
  
  if (text.length > 2500) {
    return { valid: false, message: 'Text must be 2,500 characters or less' };
  }
  
  return { valid: true };
};

/**
 * Estimate speech duration (rough calculation)
 */
export const estimateSpeechDuration = (text: string): number => {
  // Average speaking rate is about 150-160 words per minute
  const wordsPerMinute = 155;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil((wordCount / wordsPerMinute) * 60); // Return seconds
};

/**
 * Format duration in seconds to MM:SS
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
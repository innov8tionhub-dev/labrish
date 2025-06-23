/**
 * Audio processing utilities
 */

export interface AudioMetadata {
  duration: number;
  size: number;
  format: string;
  bitrate?: number;
}

/**
 * Get audio metadata from blob
 */
export const getAudioMetadata = (audioBlob: Blob): Promise<AudioMetadata> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(audioBlob);
    
    audio.addEventListener('loadedmetadata', () => {
      const metadata: AudioMetadata = {
        duration: audio.duration,
        size: audioBlob.size,
        format: audioBlob.type,
      };
      
      URL.revokeObjectURL(url);
      resolve(metadata);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio metadata'));
    });
    
    audio.src = url;
  });
};

/**
 * Convert audio blob to different format (basic implementation)
 */
export const convertAudioFormat = async (
  audioBlob: Blob, 
  targetFormat: 'mp3' | 'wav' | 'ogg'
): Promise<Blob> => {
  // This is a simplified implementation
  // In production, you'd use a library like FFmpeg.js or Web Audio API
  
  if (targetFormat === 'mp3' && audioBlob.type.includes('mpeg')) {
    return audioBlob; // Already MP3
  }
  
  // For now, return the original blob
  // In a real implementation, you'd convert the format
  return audioBlob;
};

/**
 * Split long audio into chunks
 */
export const splitAudioIntoChunks = async (
  audioBlob: Blob, 
  chunkDurationSeconds: number = 300 // 5 minutes
): Promise<Blob[]> => {
  // This would require Web Audio API or a specialized library
  // For now, return the original audio as a single chunk
  return [audioBlob];
};

/**
 * Merge multiple audio blobs
 */
export const mergeAudioBlobs = async (audioBlobs: Blob[]): Promise<Blob> => {
  // This would require Web Audio API
  // For now, return the first blob
  return audioBlobs[0] || new Blob();
};

/**
 * Apply audio effects (basic implementation)
 */
export interface AudioEffects {
  volume?: number; // 0-1
  speed?: number; // 0.5-2
  pitch?: number; // -12 to 12 semitones
}

export const applyAudioEffects = async (
  audioBlob: Blob, 
  effects: AudioEffects
): Promise<Blob> => {
  // This would require Web Audio API for real implementation
  // For now, return the original blob
  return audioBlob;
};

/**
 * Generate audio waveform data
 */
export const generateWaveformData = async (audioBlob: Blob): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(audioBlob);
    
    audio.addEventListener('loadeddata', () => {
      // Generate mock waveform data
      const duration = audio.duration;
      const samples = Math.floor(duration * 10); // 10 samples per second
      const waveform = Array.from({ length: samples }, () => Math.random() * 100);
      
      URL.revokeObjectURL(url);
      resolve(waveform);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to generate waveform'));
    });
    
    audio.src = url;
  });
};

/**
 * Create audio visualization canvas
 */
export const createAudioVisualization = (
  canvas: HTMLCanvasElement, 
  waveformData: number[]
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const width = canvas.width;
  const height = canvas.height;
  const barWidth = width / waveformData.length;
  
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#10b981'; // Emerald color
  
  waveformData.forEach((value, index) => {
    const barHeight = (value / 100) * height;
    const x = index * barWidth;
    const y = height - barHeight;
    
    ctx.fillRect(x, y, barWidth - 1, barHeight);
  });
};
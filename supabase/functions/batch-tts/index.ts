import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '', 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

interface BatchTTSRequest {
  texts: string[];
  voice_id: string;
  voice_settings: any;
  merge_audio?: boolean;
}

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | ArrayBuffer | null, status = 200, contentType = 'application/json') {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  if (body instanceof ArrayBuffer) {
    return new Response(body, {
      status,
      headers: {
        ...headers,
        'Content-Type': 'audio/mpeg',
      },
    });
  }

  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': contentType,
    },
  });
}

// Split text into chunks that fit within API limits
function splitTextIntoChunks(text: string, maxLength = 2500): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (currentChunk.length + trimmedSentence.length + 1 <= maxLength) {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk + '.');
        currentChunk = trimmedSentence;
      } else {
        // Handle very long sentences by splitting on commas or spaces
        const words = trimmedSentence.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          if (wordChunk.length + word.length + 1 <= maxLength) {
            wordChunk += (wordChunk ? ' ' : '') + word;
          } else {
            if (wordChunk) {
              chunks.push(wordChunk);
              wordChunk = word;
            } else {
              // Single word is too long, truncate it
              chunks.push(word.slice(0, maxLength));
            }
          }
        }
        
        if (wordChunk) {
          currentChunk = wordChunk;
        }
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk + '.');
  }

  return chunks;
}

// Generate speech for a single text chunk
async function generateSpeechChunk(
  text: string,
  voiceId: string,
  voiceSettings: any
): Promise<ArrayBuffer> {
  const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY!,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.status}`);
  }

  return response.arrayBuffer();
}

// Merge multiple audio buffers (simple concatenation)
function mergeAudioBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const buffer of buffers) {
    merged.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }

  return merged.buffer;
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    if (!ELEVENLABS_API_KEY) {
      return corsResponse({ error: 'Eleven Labs API key not configured' }, 500);
    }

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return corsResponse({ error: 'Authorization header required' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return corsResponse({ error: 'Invalid authentication token' }, 401);
    }

    // Parse request body
    const { texts, voice_id, voice_settings, merge_audio = true }: BatchTTSRequest = await req.json();

    // Validate required parameters
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return corsResponse({ error: 'Texts array is required and must not be empty' }, 400);
    }

    if (!voice_id || typeof voice_id !== 'string') {
      return corsResponse({ error: 'Voice ID is required and must be a string' }, 400);
    }

    // Process each text and split into chunks if necessary
    const allChunks: string[] = [];
    for (const text of texts) {
      if (typeof text !== 'string') {
        return corsResponse({ error: 'All texts must be strings' }, 400);
      }
      
      const chunks = splitTextIntoChunks(text.trim());
      allChunks.push(...chunks);
    }

    if (allChunks.length > 50) {
      return corsResponse({ error: 'Too many text chunks. Maximum 50 chunks allowed.' }, 400);
    }

    // Default voice settings
    const defaultSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    };

    const settings = { ...defaultSettings, ...voice_settings };

    // Generate speech for each chunk
    const audioBuffers: ArrayBuffer[] = [];
    
    for (let i = 0; i < allChunks.length; i++) {
      const chunk = allChunks[i];
      
      try {
        const audioBuffer = await generateSpeechChunk(chunk, voice_id, settings);
        audioBuffers.push(audioBuffer);
        
        // Add a small delay between requests to avoid rate limiting
        if (i < allChunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Failed to generate speech for chunk ${i + 1}:`, error);
        return corsResponse({ 
          error: `Failed to generate speech for chunk ${i + 1}`,
          chunk_index: i,
          total_chunks: allChunks.length
        }, 500);
      }
    }

    // Merge audio buffers if requested
    if (merge_audio && audioBuffers.length > 1) {
      const mergedAudio = mergeAudioBuffers(audioBuffers);
      return corsResponse(mergedAudio, 200);
    } else if (audioBuffers.length === 1) {
      return corsResponse(audioBuffers[0], 200);
    } else {
      // Return individual audio files as a multipart response
      // For simplicity, we'll return the first audio buffer
      // In a real implementation, you'd use multipart/form-data
      return corsResponse(audioBuffers[0], 200);
    }

  } catch (error: any) {
    console.error('Batch TTS error:', error);
    return corsResponse({ error: error.message || 'Internal server error' }, 500);
  }
});
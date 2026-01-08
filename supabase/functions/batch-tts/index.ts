import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3@3.600.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

const LABRISH_S3 = Deno.env.get('LABRISH_S3');
const LABRISH_S3_SECRET = Deno.env.get('LABRISH_S3_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const S3_BUCKET = 'user-files';

const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? '';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${projectRef}.supabase.co/storage/v1/s3`,
  credentials: {
    accessKeyId: LABRISH_S3 ?? '',
    secretAccessKey: LABRISH_S3_SECRET ?? '',
  },
  forcePathStyle: true,
});

async function uploadToS3(audioData: ArrayBuffer, userId: string): Promise<string> {
  const timestamp = Date.now();
  const hash = Math.random().toString(36).substring(2, 10);
  const fileName = `audio/${userId}/${timestamp}-${hash}.mp3`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileName,
    Body: new Uint8Array(audioData),
    ContentType: 'audio/mpeg',
  });

  await s3Client.send(command);

  return `${SUPABASE_URL}/storage/v1/object/public/${S3_BUCKET}/${fileName}`;
}

interface BatchTTSRequest {
  texts: string[];
  voice_id: string;
  voice_settings: any;
  merge_audio?: boolean;
}

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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return corsResponse({ error: 'Authorization header required' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return corsResponse({ error: 'Invalid authentication token' }, 401);
    }

    const { texts, voice_id, voice_settings, merge_audio = true }: BatchTTSRequest = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return corsResponse({ error: 'Texts array is required and must not be empty' }, 400);
    }

    if (!voice_id || typeof voice_id !== 'string') {
      return corsResponse({ error: 'Voice ID is required and must be a string' }, 400);
    }

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

    const defaultSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    };

    const settings = { ...defaultSettings, ...voice_settings };

    const audioBuffers: ArrayBuffer[] = [];
    
    for (let i = 0; i < allChunks.length; i++) {
      const chunk = allChunks[i];
      
      try {
        const audioBuffer = await generateSpeechChunk(chunk, voice_id, settings);
        audioBuffers.push(audioBuffer);
        
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

    let finalAudio: ArrayBuffer;
    if (merge_audio && audioBuffers.length > 1) {
      finalAudio = mergeAudioBuffers(audioBuffers);
    } else {
      finalAudio = audioBuffers[0];
    }

    let audioUrl: string | null = null;
    if (LABRISH_S3 && LABRISH_S3_SECRET) {
      try {
        audioUrl = await uploadToS3(finalAudio, user.id);
        console.log(`Batch audio uploaded to S3: ${audioUrl}`);

        const { error: recordError } = await supabase
          .from('audio_files')
          .insert({
            user_id: user.id,
            file_path: audioUrl.split('/user-files/')[1] || '',
            file_name: audioUrl.split('/').pop() || '',
            file_size: finalAudio.byteLength,
            content_type: 'audio/mpeg',
          });

        if (recordError) {
          console.error('Error recording audio file:', recordError);
        }
      } catch (s3Error) {
        console.error('S3 upload failed, returning audio without storage:', s3Error);
      }
    }

    return new Response(finalAudio, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'audio/mpeg',
        'X-Audio-Url': audioUrl || '',
      },
    });

  } catch (error: any) {
    console.error('Batch TTS error:', error);
    return corsResponse({ error: error.message || 'Internal server error' }, 500);
  }
});
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '', 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | ArrayBuffer | null, status = 200, contentType = 'application/json') {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  // For binary data (audio)
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
    const { text, voice_id, voice_settings } = await req.json();

    // Validate required parameters
    if (!text || typeof text !== 'string') {
      return corsResponse({ error: 'Text is required and must be a string' }, 400);
    }

    if (!voice_id || typeof voice_id !== 'string') {
      return corsResponse({ error: 'Voice ID is required and must be a string' }, 400);
    }

    // Validate text length
    if (text.length > 2500) {
      return corsResponse({ error: 'Text must be 2,500 characters or less' }, 400);
    }

    if (text.trim().length === 0) {
      return corsResponse({ error: 'Text cannot be empty' }, 400);
    }

    // Default voice settings
    const defaultSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    };

    const settings = { ...defaultSettings, ...voice_settings };

    // Validate voice settings
    if (settings.stability < 0 || settings.stability > 1) {
      return corsResponse({ error: 'Stability must be between 0 and 1' }, 400);
    }

    if (settings.similarity_boost < 0 || settings.similarity_boost > 1) {
      return corsResponse({ error: 'Similarity boost must be between 0 and 1' }, 400);
    }

    if (settings.style < 0 || settings.style > 1) {
      return corsResponse({ error: 'Style must be between 0 and 1' }, 400);
    }

    // Make request to Eleven Labs API
    const elevenLabsResponse = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: settings,
      }),
    });

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error('Eleven Labs API error:', errorText);
      
      if (elevenLabsResponse.status === 401) {
        return corsResponse({ error: 'Invalid Eleven Labs API key' }, 500);
      } else if (elevenLabsResponse.status === 422) {
        return corsResponse({ error: 'Invalid voice ID or parameters' }, 400);
      } else if (elevenLabsResponse.status === 429) {
        return corsResponse({ error: 'Rate limit exceeded. Please try again later.' }, 429);
      } else {
        return corsResponse({ error: 'Failed to generate speech' }, 500);
      }
    }

    // Get audio data as ArrayBuffer
    const audioData = await elevenLabsResponse.arrayBuffer();

    // Return audio data
    return corsResponse(audioData, 200);

  } catch (error: any) {
    console.error('TTS error:', error);
    return corsResponse({ error: error.message || 'Internal server error' }, 500);
  }
});
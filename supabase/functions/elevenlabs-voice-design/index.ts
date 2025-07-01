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
    const {
      voiceDescription,
      model_id = 'eleven_multilingual_ttv_v2',
      text = '',
      auto_generate_text = true,
      loudness = 0.5,
      seed = 42,
      guidance_scale = 5,
      reference_audio = null,
      reference_audio_weight = 0.5,
    } = await req.json();

    // Validate required parameters
    if (!voiceDescription || typeof voiceDescription !== 'string') {
      return corsResponse({ error: 'Voice description is required and must be a string' }, 400);
    }

    // Prepare the request body for ElevenLabs
    const requestBody: Record<string, any> = {
      voice_description: voiceDescription.trim(),
      model_id,
      text: text || undefined,
      auto_generate_text,
      loudness,
      seed,
      guidance_scale,
    };

    // Only include reference audio if provided
    if (reference_audio) {
      requestBody.reference_audio_base64 = reference_audio;
      requestBody.prompt_strength = reference_audio_weight;
    }

    // Make request to ElevenLabs API (correct endpoint)
    const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-voice/design`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      let errorMessage = 'Failed to generate voice design';
      if (errorData.detail && typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (errorData.message && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else if (errorData.error && typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      return corsResponse({
        error: errorMessage,
        details: errorData,
        status: response.status
      }, response.status);
    }

    // Return the voice design result (previews array)
    const result = await response.json();
    return corsResponse(result);

  } catch (error: any) {
    console.error('Voice design error:', error);
    return corsResponse({ error: error.message || 'Internal server error' }, 500);
  }
});
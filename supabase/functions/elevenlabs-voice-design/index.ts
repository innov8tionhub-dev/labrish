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
      name = 'My Custom Voice',
      model_id = 'eleven_monolingual_v1',
      text = '',
      auto_generate_text = true,
      loudness = 1,
      seed = 42,
      guidance_scale = 1.5,
      reference_audio = null,
      reference_audio_weight = 0.5,
    } = await req.json();

    // Validate required parameters
    if (!voiceDescription || typeof voiceDescription !== 'string') {
      return corsResponse({ error: 'Voice description is required and must be a string' }, 400);
    }

    // Prepare the request body
    const requestBody: Record<string, any> = {
      name,
      text: text || undefined,
      auto_generate_text,
      loudness,
      seed,
      model_id,
      guidance_scale,
    };

    // Only include description if it's not empty
    if (voiceDescription.trim()) {
      requestBody.description = voiceDescription.trim();
    }

    // Only include reference audio if provided
    if (reference_audio) {
      requestBody.reference_audio = reference_audio;
      requestBody.reference_audio_weight = reference_audio_weight;
    }

    console.log('Sending voice design request with body:', JSON.stringify(requestBody, null, 2));

    // Make request to Eleven Labs API
    const response = await fetch(`${ELEVENLABS_BASE_URL}/voice-generation/generate`, {
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
      console.error('ElevenLabs API error:', errorData);
      
      return corsResponse({ 
        error: 'Failed to generate voice design', 
        details: errorData,
        status: response.status 
      }, response.status);
    }

    // Return the voice design result
    const result = await response.json();
    return corsResponse(result);

  } catch (error: any) {
    console.error('Voice design error:', error);
    return corsResponse({ error: error.message || 'Internal server error' }, 500);
  }
});
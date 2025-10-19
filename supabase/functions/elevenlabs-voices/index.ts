import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '', 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    if (req.method !== 'GET') {
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

    // Make request to Eleven Labs API to get voices
    const elevenLabsResponse = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error('Eleven Labs API error:', errorText);
      
      if (elevenLabsResponse.status === 401) {
        return corsResponse({ error: 'Invalid Eleven Labs API key' }, 500);
      } else if (elevenLabsResponse.status === 429) {
        return corsResponse({ error: 'Rate limit exceeded. Please try again later.' }, 429);
      } else {
        return corsResponse({ error: 'Failed to fetch voices' }, 500);
      }
    }

    const voicesData = await elevenLabsResponse.json();

    // Blocked voices that should not be available
    const blockedVoices = ['Maurice', 'Monique VC'];

    // Transform and filter the voices data
    const voices = voicesData.voices
      ?.filter((voice: any) => !blockedVoices.includes(voice.name))
      .map((voice: any) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'general',
        description: voice.description || `${voice.name} voice`,
        preview_url: voice.preview_url,
        available_for_tiers: voice.available_for_tiers || [],
        settings: voice.settings,
        labels: voice.labels || {},
        samples: voice.samples || [],
        high_quality_base_model_ids: voice.high_quality_base_model_ids || [],
        safety_control: voice.safety_control,
        voice_verification: voice.voice_verification,
        sharing: voice.sharing,
      })) || [];

    // Add some Caribbean-focused voices to the top if available
    const caribbeanVoices = voices.filter((voice: any) =>
      voice.name.toLowerCase().includes('caribbean') ||
      voice.name.toLowerCase().includes('jamaican') ||
      voice.name.toLowerCase().includes('island') ||
      voice.description?.toLowerCase().includes('caribbean') ||
      voice.description?.toLowerCase().includes('jamaican') ||
      voice.labels?.accent?.toLowerCase().includes('caribbean') ||
      voice.labels?.accent?.toLowerCase().includes('jamaican')
    );

    const otherVoices = voices.filter((voice: any) =>
      !caribbeanVoices.some((cv: any) => cv.voice_id === voice.voice_id)
    );

    const sortedVoices = [...caribbeanVoices, ...otherVoices];

    return corsResponse({ voices: sortedVoices });

  } catch (error: any) {
    console.error('Voices fetch error:', error);
    return corsResponse({ error: error.message || 'Internal server error' }, 500);
  }
});
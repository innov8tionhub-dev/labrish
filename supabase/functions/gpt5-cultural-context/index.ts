import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function corsResponse(body: string | object | null, status = 200) {
  if (status === 204) {
    return new Response(null, { status, headers: corsHeaders });
  }

  return new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

interface CulturalContextRequest {
  term: string;
}

interface CulturalContext {
  term: string;
  definition: string;
  cultural_significance: string;
  pronunciation?: string;
  related_terms: string[];
  region?: string;
}

const KNOWN_TERMS: Record<string, CulturalContext> = {
  'ackee': {
    term: 'ackee',
    definition: "Jamaica's national fruit, typically cooked with saltfish",
    cultural_significance: 'Brought from West Africa in 1778, ackee has become a cornerstone of Jamaican cuisine. Ackee and saltfish is the national dish of Jamaica.',
    pronunciation: 'AH-kee',
    related_terms: ['saltfish', 'callaloo', 'breadfruit'],
    region: 'Jamaica'
  },
  'callaloo': {
    term: 'callaloo',
    definition: 'Leafy green vegetable used in Caribbean cooking, similar to spinach',
    cultural_significance: 'Popular dish across the Caribbean with variations by island. In Trinidad, it includes okra and coconut milk. In Jamaica, it\'s often steamed with onions and tomatoes.',
    pronunciation: 'cal-uh-LOO',
    related_terms: ['dasheen', 'taro leaves', 'amaranth'],
    region: 'Pan-Caribbean'
  },
  'roti': {
    term: 'roti',
    definition: 'Flatbread of Indian origin, popular in Trinidad and Guyana',
    cultural_significance: 'Represents the Indo-Caribbean influence in the region. Various types include dhalpuri, buss-up-shut, and paratha roti.',
    pronunciation: 'ROH-tee',
    related_terms: ['doubles', 'curry', 'buss-up-shut'],
    region: 'Trinidad and Tobago, Guyana'
  },
  'carnival': {
    term: 'carnival',
    definition: 'Major annual festival celebration across the Caribbean',
    cultural_significance: 'Originated as pre-Lenten celebration but evolved into expression of freedom and cultural identity. Features elaborate costumes, calypso, soca, and steelpan music.',
    pronunciation: 'KAR-ni-val',
    related_terms: ['mas', 'steelpan', 'soca', 'calypso', 'j\'ouvert'],
    region: 'Trinidad, Jamaica, Barbados, St. Lucia'
  },
  'steelpan': {
    term: 'steelpan',
    definition: 'Musical instrument made from oil drums, invented in Trinidad',
    cultural_significance: 'Only acoustic instrument invented in the 20th century. Born out of creativity and resistance during colonial era.',
    pronunciation: 'STEEL-pan',
    related_terms: ['pannist', 'steelband', 'pan yard'],
    region: 'Trinidad and Tobago'
  },
  'jonkonnu': {
    term: 'jonkonnu',
    definition: 'Traditional masked dance celebration with African roots',
    cultural_significance: 'Performed during Christmas season, combines African, European, and indigenous elements. Features elaborate costumes and masks.',
    pronunciation: 'JON-kuh-noo',
    related_terms: ['masquerade', 'mummer', 'John Canoe'],
    region: 'Jamaica, Bahamas'
  },
  'patois': {
    term: 'patois',
    definition: 'Jamaican Creole language, mixture of English and African languages',
    cultural_significance: 'Represents linguistic resistance and cultural identity. Evolved during slavery as a means of communication between enslaved Africans and European colonizers.',
    pronunciation: 'PAT-wah',
    related_terms: ['creole', 'broken English', 'dialect'],
    region: 'Jamaica'
  },
  'reggae': {
    term: 'reggae',
    definition: 'Music genre that originated in Jamaica in the late 1960s',
    cultural_significance: 'Evolved from ska and rocksteady. Became voice of resistance and spiritual expression, popularized globally by Bob Marley.',
    pronunciation: 'REG-ay',
    related_terms: ['ska', 'rocksteady', 'dub', 'dancehall'],
    region: 'Jamaica'
  }
};

async function checkCache(term: string): Promise<CulturalContext | null> {
  const { data, error } = await supabase
    .from('cultural_knowledge_base')
    .select('data')
    .eq('term', term.toLowerCase())
    .maybeSingle();

  if (error || !data) return null;

  return data.data as CulturalContext;
}

async function cacheContext(term: string, context: CulturalContext): Promise<void> {
  await supabase
    .from('cultural_knowledge_base')
    .upsert({
      term: term.toLowerCase(),
      data: context,
      updated_at: new Date().toISOString()
    });
}

async function getContextFromGPT5(term: string): Promise<CulturalContext> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are a Caribbean cultural expert. Provide detailed, accurate information about Caribbean cultural terms.

Return ONLY a JSON object with this exact structure:
{
  "term": "the term",
  "definition": "clear, concise definition",
  "cultural_significance": "why it matters culturally, historical context",
  "pronunciation": "phonetic pronunciation (optional)",
  "related_terms": ["related", "terms", "array"],
  "region": "primary Caribbean region(s)"
}

Be factual, respectful, and educational.`;

  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-nano',
      input: `${systemPrompt}\n\nProvide cultural context for: ${term}`,
      reasoning: { effort: 'low' },
      text: {
        verbosity: 'medium',
        format: {
          type: 'json_schema',
          name: 'cultural_context',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              term: { type: 'string' },
              definition: { type: 'string' },
              cultural_significance: { type: 'string' },
              pronunciation: { type: 'string' },
              related_terms: {
                type: 'array',
                items: { type: 'string' }
              },
              region: { type: 'string' }
            },
            required: ['term', 'definition', 'cultural_significance', 'related_terms'],
            additionalProperties: false
          }
        }
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GPT-5 API error: ${response.status} ${error}`);
  }

  const data = await response.json();

  // Extract text from the new GPT-5 Responses API format
  let outputText = '';
  if (Array.isArray(data.output)) {
    const messageObj = data.output.find((item: any) => item.type === 'message');
    if (messageObj && messageObj.content && Array.isArray(messageObj.content)) {
      const textContent = messageObj.content.find((c: any) => c.type === 'text' || c.type === 'output_text');
      outputText = textContent?.text || '';
    }
  } else {
    outputText = data.output_text || data.output || '';
  }

  if (!outputText) {
    throw new Error('No output received from GPT-5');
  }

  // Parse the JSON response
  try {
    return JSON.parse(outputText);
  } catch (parseError) {
    // Fallback: try to extract JSON from text
    const jsonMatch = outputText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse cultural context response');
    }
    return JSON.parse(jsonMatch[0]);
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
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

    const body: CulturalContextRequest = await req.json();
    const { term } = body;

    if (!term) {
      return corsResponse({ error: 'Missing required field: term' }, 400);
    }

    const normalizedTerm = term.toLowerCase().trim();

    const knownContext = KNOWN_TERMS[normalizedTerm];
    if (knownContext) {
      return corsResponse({
        success: true,
        context: knownContext,
        source: 'built-in'
      });
    }

    const cachedContext = await checkCache(normalizedTerm);
    if (cachedContext) {
      return corsResponse({
        success: true,
        context: cachedContext,
        source: 'cache'
      });
    }

    const aiContext = await getContextFromGPT5(term);
    await cacheContext(normalizedTerm, aiContext);

    return corsResponse({
      success: true,
      context: aiContext,
      source: 'ai'
    });

  } catch (error: any) {
    console.error('Cultural Context Error:', error);
    return corsResponse({
      error: 'Failed to fetch cultural context',
      message: error.message || 'Unknown error occurred'
    }, 500);
  }
});

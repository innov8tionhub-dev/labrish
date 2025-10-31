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

interface DialectSuggestion {
  original: string;
  replacement: string;
  position: [number, number];
  explanation: string;
}

interface DialectEnhanceRequest {
  text: string;
  intensity?: 'mild' | 'moderate' | 'strong';
}

const CARIBBEAN_EXPRESSIONS: Record<string, { replacement: string; explanation: string }> = {
  'very good': { replacement: 'wicked', explanation: 'Common Jamaican expression for excellent' },
  'hello': { replacement: 'wah gwaan', explanation: 'Jamaican greeting meaning "what\'s going on"' },
  'friend': { replacement: 'bredrin', explanation: 'Jamaican term for close friend or brother' },
  'what are you doing': { replacement: 'wah yuh ah do', explanation: 'Patois for "what are you doing"' },
  'okay': { replacement: 'irie', explanation: 'Jamaican expression meaning all is well' },
  'crazy': { replacement: 'mad up', explanation: 'Caribbean expression for crazy or wild' },
  'small': { replacement: 'likkle', explanation: 'Patois for small or little' },
  'children': { replacement: 'pickney', explanation: 'Caribbean term for children' },
  'food': { replacement: 'nyam', explanation: 'Jamaican word for food or eating' },
  'money': { replacement: 'bread', explanation: 'Caribbean slang for money' },
};

async function callGPT5Nano(text: string, intensity: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const intensityGuidance = {
    mild: 'Suggest 2-3 subtle Caribbean dialect replacements (10-20% of text)',
    moderate: 'Suggest 4-6 Caribbean dialect enhancements (30-50% of text)',
    strong: 'Provide extensive Caribbean dialect transformation (60%+ of text)'
  };

  const systemPrompt = `You are a Caribbean dialect expert. Analyze the text and suggest authentic
Caribbean dialect replacements that would make the text sound more Caribbean.

${intensityGuidance[intensity as keyof typeof intensityGuidance]}

Return ONLY a JSON array of suggestions with this exact format:
[
  {
    "original": "exact phrase to replace",
    "replacement": "Caribbean dialect version",
    "position": [start_index, end_index],
    "explanation": "brief cultural explanation"
  }
]

Focus on: Jamaican Patois, Trinidadian Creole, and common Caribbean expressions.
Maintain meaning while adding authentic Caribbean flavor.`;

  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-nano',
      input: `${systemPrompt}\n\nText to enhance: ${text}`,
      reasoning: { effort: 'minimal' },
      text: {
        verbosity: 'low',
        format: {
          type: 'json_schema',
          name: 'dialect_suggestions',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              suggestions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    original: { type: 'string' },
                    replacement: { type: 'string' },
                    position: {
                      type: 'array',
                      items: { type: 'number' },
                      minItems: 2,
                      maxItems: 2
                    },
                    explanation: { type: 'string' }
                  },
                  required: ['original', 'replacement', 'position', 'explanation'],
                  additionalProperties: false
                }
              }
            },
            required: ['suggestions'],
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

  return outputText;
}

function findLocalSuggestions(text: string, intensity: string): DialectSuggestion[] {
  const suggestions: DialectSuggestion[] = [];
  const lowerText = text.toLowerCase();

  const maxSuggestions = {
    mild: 2,
    moderate: 4,
    strong: 999
  };

  const limit = maxSuggestions[intensity as keyof typeof maxSuggestions] || 2;

  for (const [phrase, data] of Object.entries(CARIBBEAN_EXPRESSIONS)) {
    if (suggestions.length >= limit) break;

    const index = lowerText.indexOf(phrase);
    if (index !== -1) {
      suggestions.push({
        original: phrase,
        replacement: data.replacement,
        position: [index, index + phrase.length],
        explanation: data.explanation
      });
    }
  }

  return suggestions;
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

    const body: DialectEnhanceRequest = await req.json();
    const { text, intensity = 'moderate' } = body;

    if (!text) {
      return corsResponse({ error: 'Missing required field: text' }, 400);
    }

    let suggestions: DialectSuggestion[] = findLocalSuggestions(text, intensity);

    if (suggestions.length < 2) {
      try {
        const aiResponse = await callGPT5Nano(text, intensity);

        try {
          // Try to parse as structured JSON first
          const parsed = JSON.parse(aiResponse);
          if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            suggestions = [...suggestions, ...parsed.suggestions];
          } else if (Array.isArray(parsed)) {
            suggestions = [...suggestions, ...parsed];
          } else {
            // Fallback: try to extract JSON array from text
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const aiSuggestions = JSON.parse(jsonMatch[0]);
              suggestions = [...suggestions, ...aiSuggestions];
            }
          }
        } catch (parseError) {
          console.error('Failed to parse AI suggestions:', parseError);
        }
      } catch (aiError) {
        console.error('AI enhancement failed, using local suggestions only:', aiError);
      }
    }

    return corsResponse({
      success: true,
      suggestions: suggestions.slice(0, intensity === 'mild' ? 3 : intensity === 'moderate' ? 6 : 10),
      source: suggestions.length > 0 ? 'hybrid' : 'local'
    });

  } catch (error: any) {
    console.error('Dialect Enhancement Error:', error);
    return corsResponse({
      error: 'Dialect enhancement failed',
      message: error.message || 'Unknown error occurred'
    }, 500);
  }
});

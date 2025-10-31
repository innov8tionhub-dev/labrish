import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const FREE_TIER_AI_LIMIT = 5;
const PRO_TIER_AI_LIMIT = 50;

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

interface StoryAssistRequest {
  action: 'generate' | 'expand' | 'polish' | 'prompt';
  input: string;
  context?: {
    category?: string;
    audience?: string;
    length?: number;
    dialectStrength?: 'mild' | 'moderate' | 'strong';
    previousResponseId?: string;
  };
  model?: 'gpt-5-mini' | 'gpt-5-nano';
  reasoning?: 'minimal' | 'low' | 'medium' | 'high';
  verbosity?: 'low' | 'medium' | 'high';
}

async function checkAIAssistLimit(userId: string): Promise<{ allowed: boolean; count: number; limit: number; isPro: boolean }> {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { data: subscription } = await supabase
    .from('stripe_user_subscriptions')
    .select('subscription_status')
    .eq('user_id', userId)
    .maybeSingle();

  const isPro = subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing';
  const limit = isPro ? PRO_TIER_AI_LIMIT : FREE_TIER_AI_LIMIT;

  const { count } = await supabase
    .from('ai_assist_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('month', currentMonth);

  const usageCount = count ?? 0;

  return {
    allowed: usageCount < limit,
    count: usageCount,
    limit,
    isPro
  };
}

async function logAIAssistUsage(
  userId: string,
  assistType: string,
  model: string,
  tokensUsed: number,
  reasoningEffort?: string
) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  await supabase.from('ai_assist_usage').insert({
    user_id: userId,
    assist_type: assistType,
    model,
    tokens_used: tokensUsed,
    reasoning_effort: reasoningEffort,
    month: currentMonth,
  });
}

function buildSystemPrompt(action: string, context?: any): string {
  const basePrompt = `You are a Caribbean storytelling assistant helping users create authentic stories
incorporating Jamaican Patois, Trinidadian Creole, and other Caribbean dialects.
Your responses should:
- Include culturally accurate references to Caribbean food, traditions, locations, and folklore
- Suggest authentic Caribbean expressions and dialect when appropriate
- Maintain respect for Caribbean culture and avoid stereotypes
- Be engaging and creative while staying true to Caribbean voice and experience`;

  const actionPrompts: Record<string, string> = {
    generate: `\n\nGenerate a complete Caribbean story based on the user's input.
Include vivid descriptions, authentic dialogue, and cultural elements.`,

    expand: `\n\nExpand the user's outline into a full narrative.
Maintain their voice while adding Caribbean cultural details, atmosphere, and authentic dialect.`,

    polish: `\n\nAnalyze the story and provide improvement suggestions focusing on:
- Pacing and structure
- Character consistency
- Dialogue authenticity and Caribbean speech patterns
- Cultural accuracy
- Grammar and clarity
Return JSON format: { "overall_score": number, "readability": string, "suggestions": array }`,

    prompt: `\n\nGenerate 3 creative story prompts for Caribbean storytelling.
Each should be engaging, culturally relevant, and inspire authentic Caribbean narratives.
Return a JSON object with a 'prompts' array containing objects with 'title', 'prompt', and 'category' fields.`
  };

  let prompt = basePrompt + (actionPrompts[action] || '');

  if (context) {
    if (context.category) prompt += `\n\nCategory: ${context.category}`;
    if (context.audience) prompt += `\nTarget audience: ${context.audience}`;
    if (context.length) prompt += `\nTarget length: approximately ${context.length} words`;
    if (context.dialectStrength) {
      const strength = {
        mild: '10-20% Caribbean expressions',
        moderate: '30-50% Caribbean dialect',
        strong: '60%+ authentic Caribbean dialect'
      };
      prompt += `\nDialect strength: ${strength[context.dialectStrength]}`;
    }
  }

  return prompt;
}

async function callGPT5(
  prompt: string,
  userInput: string,
  action: string,
  model: string = 'gpt-5-mini',
  reasoning: string = 'medium',
  verbosity: string = 'medium',
  previousResponseId?: string
): Promise<{ output: string; tokensUsed: number; responseId: string }> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const requestBody: any = {
    model,
    input: `${prompt}\n\nUser input: ${userInput}`,
    reasoning: { effort: reasoning },
    text: { verbosity },
  };

  // For prompt generation, use structured output
  if (action === 'prompt') {
    requestBody.text.format = {
      type: 'json_schema',
      name: 'story_prompts',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          prompts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                prompt: { type: 'string' },
                category: { type: 'string' }
              },
              required: ['title', 'prompt', 'category'],
              additionalProperties: false
            }
          }
        },
        required: ['prompts'],
        additionalProperties: false
      }
    };
  }

  // For polish action, use structured output
  if (action === 'polish') {
    requestBody.text.format = {
      type: 'json_schema',
      name: 'story_analysis',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number', minimum: 0, maximum: 10 },
          readability: { type: 'string' },
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['pacing', 'character', 'dialogue', 'cultural', 'grammar'] },
                severity: { type: 'string', enum: ['low', 'medium', 'high'] },
                location: { type: 'string' },
                issue: { type: 'string' },
                suggestion: { type: 'string' },
                fix: { type: 'string' }
              },
              required: ['type', 'severity', 'location', 'issue', 'suggestion'],
              additionalProperties: false
            }
          },
          voice_match: { type: 'string' }
        },
        required: ['overall_score', 'readability', 'suggestions'],
        additionalProperties: false
      }
    };
  }

  if (previousResponseId) {
    requestBody.previous_response_id = previousResponseId;
  }

  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GPT-5 API error: ${response.status} ${error}`);
  }

  const data = await response.json();

  // OpenAI returns an array with [reasoning_object, message_object]
  // We need to extract the text from the message object's content
  let outputText = '';

  if (Array.isArray(data.output)) {
    // Find the message object in the array
    const messageObj = data.output.find((item: any) => item.type === 'message');
    if (messageObj && messageObj.content && Array.isArray(messageObj.content)) {
      // Extract text from content array
      const textContent = messageObj.content.find((c: any) => c.type === 'text' || c.type === 'output_text');
      outputText = textContent?.text || '';
    }
  } else {
    // Fallback to direct output
    outputText = data.output_text || data.output || '';
  }

  return {
    output: outputText,
    tokensUsed: (data.usage?.total_tokens || 0),
    responseId: data.id || '',
  };
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

    const body: StoryAssistRequest = await req.json();
    const { action, input, context, model = 'gpt-5-mini', reasoning = 'medium', verbosity = 'medium' } = body;

    if (!action || !input) {
      return corsResponse({ error: 'Missing required fields: action and input' }, 400);
    }

    const limitCheck = await checkAIAssistLimit(user.id);
    if (!limitCheck.allowed) {
      return corsResponse({
        error: 'AI assist limit reached',
        limitReached: true,
        count: limitCheck.count,
        limit: limitCheck.limit,
        isPro: limitCheck.isPro,
        message: limitCheck.isPro
          ? `You've reached your monthly limit of ${limitCheck.limit} AI assists. Your limit will reset next month.`
          : `You've reached your free tier limit of ${limitCheck.limit} AI assists. Upgrade to Pro for ${PRO_TIER_AI_LIMIT} assists per month.`
      }, 403);
    }

    const systemPrompt = buildSystemPrompt(action, context);
    const result = await callGPT5(
      systemPrompt,
      input,
      action,
      model,
      reasoning,
      verbosity,
      context?.previousResponseId
    );

    await logAIAssistUsage(user.id, action, model, result.tokensUsed, reasoning);

    return corsResponse({
      success: true,
      output: result.output,
      responseId: result.responseId,
      usage: {
        count: limitCheck.count + 1,
        limit: limitCheck.limit,
        remaining: limitCheck.limit - limitCheck.count - 1
      }
    });

  } catch (error: any) {
    console.error('GPT-5 Story Assistant Error:', error);
    return corsResponse({
      error: 'Story assistant failed',
      message: error.message || 'Unknown error occurred'
    }, 500);
  }
});
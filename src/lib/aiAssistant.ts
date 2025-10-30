import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface AIAssistResponse {
  success: boolean;
  output?: string;
  responseId?: string;
  usage?: {
    count: number;
    limit: number;
    remaining: number;
  };
  error?: string;
  limitReached?: boolean;
  message?: string;
}

export interface DialectSuggestion {
  original: string;
  replacement: string;
  position: [number, number];
  explanation: string;
}

export interface CulturalContext {
  term: string;
  definition: string;
  cultural_significance: string;
  pronunciation?: string;
  related_terms: string[];
  region?: string;
}

async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return session.access_token;
}

export async function generateStory(
  prompt: string,
  options?: {
    category?: string;
    audience?: string;
    length?: number;
    dialectStrength?: 'mild' | 'moderate' | 'strong';
    previousResponseId?: string;
  }
): Promise<AIAssistResponse> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gpt5-story-assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate',
        input: prompt,
        context: options,
        model: 'gpt-5-mini',
        reasoning: 'medium',
        verbosity: 'medium',
      }),
    });

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to generate story',
    };
  }
}

export async function expandStory(
  outline: string,
  options?: {
    length?: number;
    previousResponseId?: string;
  }
): Promise<AIAssistResponse> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gpt5-story-assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'expand',
        input: outline,
        context: options,
        model: 'gpt-5-mini',
        reasoning: 'medium',
        verbosity: 'high',
      }),
    });

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to expand story',
    };
  }
}

export async function polishStory(text: string): Promise<AIAssistResponse> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gpt5-story-assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'polish',
        input: text,
        model: 'gpt-5-mini',
        reasoning: 'high',
        verbosity: 'high',
      }),
    });

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to polish story',
    };
  }
}

export async function generatePrompts(
  category?: string
): Promise<AIAssistResponse> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gpt5-story-assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'prompt',
        input: category ? `Generate prompts for ${category} category` : 'Generate diverse Caribbean story prompts',
        model: 'gpt-5-nano',
        reasoning: 'minimal',
        verbosity: 'low',
      }),
    });

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to generate prompts',
    };
  }
}

export async function getDialectSuggestions(
  text: string,
  intensity: 'mild' | 'moderate' | 'strong' = 'moderate'
): Promise<{ success: boolean; suggestions?: DialectSuggestion[]; error?: string }> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gpt5-dialect-enhance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        intensity,
      }),
    });

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get dialect suggestions',
    };
  }
}

export async function getCulturalContext(
  term: string
): Promise<{ success: boolean; context?: CulturalContext; source?: string; error?: string }> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gpt5-cultural-context`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        term,
      }),
    });

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get cultural context',
    };
  }
}

export async function checkAIAssistUsage(): Promise<{
  current: number;
  limit: number;
  remaining: number;
  percentage: number;
  isPro: boolean;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: subscription } = await supabase
      .from('stripe_user_subscriptions')
      .select('subscription_status')
      .eq('user_id', user.id)
      .maybeSingle();

    const isPro = subscription?.subscription_status === 'active' ||
      subscription?.subscription_status === 'trialing';

    const limit = isPro ? 50 : 5;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { count } = await supabase
      .from('ai_assist_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('month', currentMonth);

    const current = count || 0;
    const remaining = Math.max(0, limit - current);
    const percentage = Math.min(Math.round((current / limit) * 100), 100);

    return {
      current,
      limit,
      remaining,
      percentage,
      isPro,
    };
  } catch (error) {
    return {
      current: 0,
      limit: 5,
      remaining: 5,
      percentage: 0,
      isPro: false,
    };
  }
}

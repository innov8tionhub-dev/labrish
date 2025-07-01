import { useState } from 'react';

// Added missing closing bracket for recentActivities useState initialization
const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'story_created',
      title: 'Created "Anansi and the Golden Mango"',
      timestamp: '2 hours ago',
      metadata: { category: 'folklore', duration: '3:45' }
    },
    {
      id: '2',
      type: 'audio_generated',
      title: 'Generated audio for "Caribbean Sunset"',
      timestamp: '5 hours ago',
      metadata: { voice: 'Jamaican Female', length: '2:30' }
    },
    {
      id: '3',
      type: 'voice_trained',
      title: 'Completed voice training session',
      timestamp: '1 day ago',
      metadata: { accuracy: '94%', samples: 15 }
    },
    {
      id: '4',
      type: 'story_shared',
      title: 'Shared "Island Breeze" publicly',
      timestamp: '2 days ago',
      metadata: { views: 23, likes: 8 }
    }
  ]);

// Added missing closing bracket for loadGenerationStats function
const loadGenerationStats = async () => {
    try {
      // First determine user tier
      const { data: subscription } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status')
        .maybeSingle();
      
      const isPro = subscription?.subscription_status === 'active' || 
                    subscription?.subscription_status === 'trialing';
      
      const limit = isPro ? 40 : 5; // Pro or Free tier limit
      
      // Get current month's usage
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const { data: generationData } = await supabase
        .from('user_generation_counts')
        .select('generation_count')
        .eq('month', currentMonth)
        .maybeSingle();
      
      const count = generationData?.generation_count || 0;
      const percentage = Math.min(Math.round((count / limit) * 100), 100);
      
      setGenerationStats({
        current: count,
        limit,
        percentage
      });
    } catch (error) {
      console.error('Failed to load generation stats:', error);
    }
  };

// Added missing closing bracket for Dashboard component
export default Dashboard;
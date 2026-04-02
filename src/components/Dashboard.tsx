import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Crown, Mic, Volume2, BarChart3, Activity, Shield, CreditCard as Edit, Zap, Play, Compass, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAnalytics } from '@/lib/analytics';
import { useOfflineSupport } from '@/lib/offlineSupport';
import { createBillingPortalSession } from '@/lib/stripe';
import { useDashboardStats, useMonthlyStats, useRecentActivities } from '@/hooks/useDashboardStats';
import PersonalizedTips from '@/components/dashboard/PersonalizedTips';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardQuickLinks, { QuickLink } from '@/components/dashboard/DashboardQuickLinks';
import DashboardActivities from '@/components/dashboard/DashboardActivities';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { useToast } from '@/components/common/Toast';
import { errorHandler } from '@/lib/errorHandling';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

interface StoryData {
  id: string;
  title: string | null;
  content: string | null;
  category: string | null;
  voice_id: string | null;
  voice_settings: Record<string, unknown> | null;
  updated_at: string;
}

interface UsageStats {
  current: number;
  limit: number;
  percentage: number;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generationStats, setGenerationStats] = useState<UsageStats>({ current: 0, limit: 5, percentage: 0 });
  const [aiAssistStats, setAIAssistStats] = useState<UsageStats>({ current: 0, limit: 5, percentage: 0 });
  const [lastStory, setLastStory] = useState<StoryData | null>(null);
  const [loadingLastStory, setLoadingLastStory] = useState(true);

  const navigate = useNavigate();
  const { track } = useAnalytics();
  const { isOnline, queueSize } = useOfflineSupport();
  const { success: showSuccess, error: showError } = useToast();

  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats(user?.id);
  const { stats: monthlyStats, loading: monthlyLoading } = useMonthlyStats(user?.id);
  const { activities: recentActivities, loading: activitiesLoading } = useRecentActivities(user?.id, 4);

  const fetchSubscription = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        errorHandler.logError(error.message, { context: 'fetchSubscription' });
      } else {
        setSubscription(data);
      }
    } catch (err) {
      errorHandler.logError(err as Error, { context: 'fetchSubscription' });
    }
  }, []);

  const loadUsageStats = useCallback(async (userId: string) => {
    try {
      const { data: sub } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status')
        .eq('user_id', userId)
        .maybeSingle();

      const isPro = sub?.subscription_status === 'active' || sub?.subscription_status === 'trialing';
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const ttsLimit = isPro ? 40 : 5;
      const { data: generationData } = await supabase
        .from('user_generation_counts')
        .select('generation_count')
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .maybeSingle();

      const ttsCount = generationData?.generation_count || 0;
      setGenerationStats({
        current: ttsCount,
        limit: ttsLimit,
        percentage: Math.min(Math.round((ttsCount / ttsLimit) * 100), 100),
      });

      const aiLimit = isPro ? 50 : 5;
      const { count } = await supabase
        .from('ai_assist_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('month', currentMonth);

      const aiCount = count || 0;
      setAIAssistStats({
        current: aiCount,
        limit: aiLimit,
        percentage: Math.min(Math.round((aiCount / aiLimit) * 100), 100),
      });
    } catch (err) {
      errorHandler.logError(err as Error, { context: 'loadUsageStats' });
    }
  }, []);

  const loadLastStory = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('id, title, content, category, voice_id, voice_settings, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLastStory(data);
      }
    } catch (err) {
      errorHandler.logError(err as Error, { context: 'loadLastStory' });
    } finally {
      setLoadingLastStory(false);
    }
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        await Promise.all([
          fetchSubscription(user.id),
          loadUsageStats(user.id),
          loadLastStory(user.id),
        ]);
        track('dashboard_viewed', { user_id: user.id });
      }
      setLoading(false);
    };

    getUser();
  }, [track, fetchSubscription, loadUsageStats, loadLastStory]);

  const handleSignOut = useCallback(async () => {
    track('user_signed_out');
    await supabase.auth.signOut();
    navigate('/');
  }, [track, navigate]);

  const handleContinueLastStory = useCallback(() => {
    if (lastStory) {
      track('continue_last_story_clicked', { story_id: lastStory.id });
      navigate(`/text-to-speech?continue=${lastStory.id}`);
    }
  }, [lastStory, track, navigate]);

  const openStripePortal = useCallback(async () => {
    try {
      track('stripe_portal_clicked');
      const { url } = await createBillingPortalSession();
      window.location.href = url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Please try again later';
      errorHandler.logError(err as Error, { context: 'openStripePortal' });
      showError('Failed to open billing portal', message);
    }
  }, [track, showError]);

  const getSubscriptionStatus = useCallback(() => {
    if (!subscription) return 'Free';
    switch (subscription.subscription_status) {
      case 'active': return 'Labrish Pro';
      case 'trialing': return 'Labrish Pro (Trial)';
      case 'past_due': return 'Labrish Pro (Past Due)';
      case 'canceled': return 'Labrish Pro (Canceled)';
      default: return 'Free';
    }
  }, [subscription]);

  const getStatusColor = useCallback(() => {
    if (!subscription) return 'text-gray-600';
    switch (subscription.subscription_status) {
      case 'active': return 'text-emerald-600';
      case 'trialing': return 'text-blue-600';
      case 'past_due': return 'text-yellow-600';
      case 'canceled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, [subscription]);

  const quickLinks: QuickLink[] = React.useMemo(() => [
    {
      id: 'recent-activities',
      title: 'Recent Activities',
      description: 'View your latest actions and creations',
      icon: <Activity className="w-6 h-6" />,
      action: () => {
        track('quick_link_clicked', { link: 'recent_activities' });
        document.getElementById('recent-activities')?.scrollIntoView({ behavior: 'smooth' });
      },
      color: 'from-emerald-500 to-teal-500',
      status: 'active' as const,
    },
    {
      id: 'text-to-speech',
      title: 'Text-to-Speech Studio',
      description: 'Create stories with Caribbean voices',
      icon: <Volume2 className="w-6 h-6" />,
      action: () => { track('quick_link_clicked', { link: 'text_to_speech' }); navigate('/text-to-speech'); },
      color: 'from-pink-500 to-rose-500',
      status: 'active' as const,
      badge: 'Popular',
    },
    {
      id: 'discover',
      title: 'Discover Stories',
      description: 'Explore trending Caribbean stories',
      icon: <Compass className="w-6 h-6" />,
      action: () => { track('quick_link_clicked', { link: 'discover' }); navigate('/discover'); },
      color: 'from-teal-500 to-cyan-500',
      status: 'active' as const,
      badge: 'New',
    },
    {
      id: 'quiz',
      title: 'Cultural Quizzes',
      description: 'Test your knowledge and earn XP',
      icon: <Trophy className="w-6 h-6" />,
      action: () => { track('quick_link_clicked', { link: 'quiz' }); navigate('/quiz'); },
      color: 'from-yellow-500 to-orange-500',
      status: 'active' as const,
      badge: 'New',
    },
    {
      id: 'analytics-overview',
      title: 'Advanced Analytics',
      description: 'Detailed insights into your content performance',
      icon: <BarChart3 className="w-6 h-6" />,
      action: () => { track('quick_link_clicked', { link: 'analytics_overview' }); navigate('/analytics'); },
      color: 'from-blue-500 to-cyan-500',
      status: 'active' as const,
    },
    {
      id: 'security-settings',
      title: 'Security Settings',
      description: 'Manage account security and privacy',
      icon: <Shield className="w-6 h-6" />,
      action: () => { track('quick_link_clicked', { link: 'security_settings' }); navigate('/security'); },
      color: 'from-red-500 to-pink-500',
      status: 'active' as const,
    },
  ], [track, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500" role="status" aria-label="Loading dashboard" />
      </div>
    );
  }

  if (!user) return null;

  const subscriptionLabel = getSubscriptionStatus();
  const statusColor = getStatusColor();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader
            user={user}
            dashboardStats={dashboardStats}
            statsLoading={statsLoading}
            aiAssistStats={aiAssistStats}
            subscriptionLabel={subscriptionLabel}
            statusColor={statusColor}
            isOnline={isOnline}
            queueSize={queueSize}
            onSignOut={handleSignOut}
          />

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <PersonalizedTips
                userStats={{
                  storiesCreated: dashboardStats.storiesCreated,
                  audioGenerated: dashboardStats.audioGenerated,
                  totalPlays: dashboardStats.totalPlays,
                }}
                onNavigate={navigate}
              />

              {!loadingLastStory && lastStory && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 }}
                >
                  <div
                    className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-xl p-6 border-2 border-emerald-300/50 hover:border-emerald-400 transition-all cursor-pointer group"
                    onClick={handleContinueLastStory}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleContinueLastStory(); }}}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Edit className="w-5 h-5 text-emerald-600" />
                          <h3 className="font-heading text-lg text-gray-800">Continue Last Story</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">{lastStory.title || 'Untitled Story'}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Last edited {new Date(lastStory.updated_at).toLocaleDateString()} &#x2022; {lastStory.content?.length || 0} characters
                        </p>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 group-hover:scale-105 transition-transform"
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              <DashboardQuickLinks links={quickLinks} />

              <DashboardActivities
                activities={recentActivities}
                loading={activitiesLoading}
                onCreateFirst={() => navigate('/text-to-speech')}
              />
            </div>

            {subscriptionLabel === 'Free' && generationStats.percentage >= 80 && (
              <motion.div
                className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-xl p-6 border border-emerald-300 mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-lg text-gray-800 mb-2">Upgrade to Labrish Pro</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      You've used {generationStats.current} of {generationStats.limit} TTS generations and {aiAssistStats.current} of {aiAssistStats.limit} AI assists.
                      Upgrade for 40 generations and 50 AI assists per month!
                    </p>
                    <Button
                      onClick={() => navigate('/pricing')}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      size="sm"
                    >
                      Unlock Pro Features
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <DashboardSidebar
              aiAssistStats={aiAssistStats}
              generationStats={generationStats}
              subscription={subscription}
              subscriptionLabel={subscriptionLabel}
              statusColor={statusColor}
              monthlyStats={monthlyStats}
              monthlyLoading={monthlyLoading}
              onNavigate={navigate}
              onOpenBilling={openStripePortal}
              track={track}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

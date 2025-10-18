import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import {
  Crown,
  LogOut,
  Settings,
  User as UserIcon,
  Mic,
  Book,
  BarChart3,
  Star,
  Volume2,
  Share2,
  Edit,
  TrendingUp,
  Activity,
  Calendar,
  Bookmark,
  Headphones,
  Palette,
  Bell,
  Shield,
  ExternalLink,
  Zap,
  CreditCard,
  Play,
  Users
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAnalytics } from '@/lib/analytics';
import { useOfflineSupport } from '@/lib/offlineSupport';
import { useDashboardStats, useMonthlyStats, useRecentActivities } from '@/hooks/useDashboardStats';
import EmptyState from '@/components/common/EmptyState';
import PersonalizedTips from '@/components/dashboard/PersonalizedTips';
import StatsCard from '@/components/dashboard/StatsCard';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

interface QuickLink {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
  badge?: string;
  status?: 'active' | 'inactive' | 'pending';
  route?: string;
}



interface GenerationStats {
  current: number;
  limit: number;
  percentage: number;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generationStats, setGenerationStats] = useState<GenerationStats>({
    current: 0,
    limit: 5,
    percentage: 0
  });


  const navigate = useNavigate();
  const { track } = useAnalytics();
  const { isOnline, queueSize } = useOfflineSupport();

  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats(user?.id);
  const { stats: monthlyStats, loading: monthlyLoading } = useMonthlyStats(user?.id);
  const { activities: recentActivities, loading: activitiesLoading } = useRecentActivities(user?.id, 4);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        await fetchSubscription();
        await loadGenerationStats();
        track('dashboard_viewed', { user_id: user.id });
      }
      setLoading(false);
    };

    getUser();
  }, [track]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

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

  const handleSignOut = async () => {
    track('user_signed_out');
    await supabase.auth.signOut();
    navigate('/');
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return 'Free';

    switch (subscription.subscription_status) {
      case 'active':
        return 'Labrish Pro';
      case 'trialing':
        return 'Labrish Pro (Trial)';
      case 'past_due':
        return 'Labrish Pro (Past Due)';
      case 'canceled':
        return 'Labrish Pro (Canceled)';
      default:
        return 'Free';
    }
  };

  const getStatusColor = () => {
    if (!subscription) return 'text-gray-600';

    switch (subscription.subscription_status) {
      case 'active':
        return 'text-emerald-600';
      case 'trialing':
        return 'text-blue-600';
      case 'past_due':
        return 'text-yellow-600';
      case 'canceled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Enhanced Quick Links with real-time status and navigation
  const quickLinks: QuickLink[] = [
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
      status: 'active'
    },
    {
      id: 'text-to-speech',
      title: 'Text-to-Speech Studio',
      description: 'Create stories with Caribbean voices',
      icon: <Volume2 className="w-6 h-6" />,
      action: () => {
        track('quick_link_clicked', { link: 'text_to_speech' });
        navigate('/text-to-speech');
      },
      color: 'from-pink-500 to-rose-500',
      status: 'active',
      badge: 'Popular',
      route: '/text-to-speech'
    },
    {
      id: 'voice-cloning',
      title: 'Voice Cloning Studio',
      description: 'Train your own AI voice model',
      icon: <Headphones className="w-6 h-6" />,
      action: () => {
        track('quick_link_clicked', { link: 'voice_cloning' });
        alert('Voice Cloning Studio is coming soon!');
      },
      color: 'from-purple-500 to-indigo-500',
      status: 'pending',
      badge: 'Coming Soon',
      route: null
    },
    {
      id: 'voice-design',
      title: 'Voice Design Studio',
      description: 'Create custom voices with AI',
      icon: <Palette className="w-6 h-6" />,
      action: () => {
        track('quick_link_clicked', { link: 'voice_design' });
        alert('Voice Design Studio is coming soon!');
      },
      color: 'from-yellow-500 to-orange-500',
      status: 'pending',
      badge: 'Coming Soon',
      route: null
    },
    {
      id: 'analytics-overview',
      title: 'Advanced Analytics',
      description: 'Detailed insights into your content performance',
      icon: <BarChart3 className="w-6 h-6" />,
      action: () => {
        track('quick_link_clicked', { link: 'analytics_overview' });
        navigate('/analytics');
      },
      color: 'from-blue-500 to-cyan-500',
      status: 'active',
      route: '/analytics'
    },
    {
      id: 'security-settings',
      title: 'Security Settings',
      description: 'Manage account security and privacy',
      icon: <Shield className="w-6 h-6" />,
      action: () => {
        track('quick_link_clicked', { link: 'security_settings' });
        navigate('/security');
      },
      color: 'from-red-500 to-pink-500',
      status: 'active',
      route: '/security'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'story_created': return <Book className="w-4 h-4 text-emerald-600" />;
      case 'audio_generated': return <Volume2 className="w-4 h-4 text-blue-600" />;
      case 'voice_trained': return <Mic className="w-4 h-4 text-purple-600" />;
      case 'story_shared': return <Share2 className="w-4 h-4 text-pink-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      case 'inactive':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      case 'pending':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
      default:
        return null;
    }
  };

  const openStripePortal = () => {
    // In a real implementation, this would redirect to Stripe Customer Portal
    track('stripe_portal_clicked');
    window.open('https://billing.stripe.com/p/login/test_00000000000000', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header with Offline Status */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-200/50 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="font-heading text-3xl text-gray-800">Welcome back!</h1>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Crown className="w-4 h-4 text-emerald-600" />
                    <span className={`text-sm font-medium ${getStatusColor()}`}>
                      {getSubscriptionStatus()}
                    </span>
                    {!isOnline && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        Offline ({queueSize} queued)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{statsLoading ? '...' : dashboardStats.storiesCreated}</div>
                  <div className="text-xs text-gray-500">Stories</div>
                  <div className="text-xs text-emerald-600">
                    {dashboardStats.weeklyGrowth.stories > 0 ? `+${dashboardStats.weeklyGrowth.stories}% growth` : 'Start creating!'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{statsLoading ? '...' : dashboardStats.audioGenerated}</div>
                  <div className="text-xs text-gray-500">Audio Files</div>
                  <div className="text-xs text-blue-600">
                    {dashboardStats.weeklyGrowth.audio > 0 ? `+${dashboardStats.weeklyGrowth.audio}% growth` : 'Generate audio'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{dashboardStats.voicesAvailable}</div>
                  <div className="text-xs text-gray-500">Voices</div>
                  <div className="text-xs text-gray-500">available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{statsLoading ? '...' : dashboardStats.totalPlays}</div>
                  <div className="text-xs text-gray-500">Total Plays</div>
                  <div className="text-xs text-pink-600">
                    {dashboardStats.totalPlays > 0 ? 'Keep sharing!' : 'Share stories'}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center gap-2 self-start lg:self-center"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Personalized Tips */}
              <PersonalizedTips
                userStats={{
                  storiesCreated: dashboardStats.storiesCreated,
                  audioGenerated: dashboardStats.audioGenerated,
                  totalPlays: dashboardStats.totalPlays
                }}
                onNavigate={navigate}
              />

              {/* Enhanced Quick Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="font-heading text-2xl text-gray-800 mb-6">Quick Links</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quickLinks.map((link, index) => (
                    <motion.div
                      key={link.id}
                      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={link.action}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${link.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                          {link.icon}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIndicator(link.status || 'active')}
                          {link.badge && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                              {link.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="font-heading text-lg text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">{link.title}</h3>
                      <p className="text-gray-600 text-sm">{link.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activities */}
              <motion.div
                id="recent-activities"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-2xl text-gray-800">Recent Activities</h2>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 overflow-hidden">
                  {activitiesLoading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                    </div>
                  ) : recentActivities.length === 0 ? (
                    <EmptyState
                      icon={Activity}
                      title="No Activities Yet"
                      description="Start creating stories with Caribbean voices to see your activity timeline here. Your journey begins with a single story!"
                      actionLabel="Create First Story"
                      onAction={() => navigate('/text-to-speech')}
                      secondaryActionLabel="Explore Voices"
                      onSecondaryAction={() => navigate('/text-to-speech')}
                    />
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {recentActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        className="p-6 hover:bg-emerald-50/50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">{activity.title}</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                              <span>{activity.timestamp}</span>
                              {activity.metadata && (
                                <>
                                  {Object.entries(activity.metadata).map(([key, value]) => (
                                    <span key={key}>• {key}: {value}</span>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Generation Stats */}
              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-heading text-lg text-gray-800">TTS Generations</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Used this month</span>
                      <span className="font-medium text-gray-800">{generationStats.current}/{generationStats.limit}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        style={{ width: `${generationStats.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {getSubscriptionStatus() === 'Free' ? (
                      <span>Upgrade to Pro for 40 generations per month</span>
                    ) : (
                      <span>Pro subscription includes 40 generations per month</span>
                    )}
                  </div>
                </div>

                {getSubscriptionStatus() === 'Free' && (
                  <Button
                    onClick={() => navigate('/pricing')}
                    className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    size="sm"
                  >
                    Upgrade to Pro
                  </Button>
                )}
              </motion.div>

              {/* Subscription Status with Management */}
              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-heading text-lg text-gray-800">Subscription</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                    <p className={`text-lg font-semibold ${getStatusColor()}`}>
                      {getSubscriptionStatus()}
                    </p>
                  </div>

                  {subscription?.current_period_end && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {subscription.cancel_at_period_end ? 'Expires' : 'Renews'}
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {(!subscription || subscription.subscription_status !== 'active') && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-emerald-700 text-sm mb-2">
                      Upgrade for unlimited access!
                    </p>
                    <Button
                      onClick={() => {
                        track('upgrade_clicked', { source: 'dashboard_sidebar' });
                        navigate('/pricing');
                      }}
                      size="sm"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                )}

                {/* Subscription Management */}
                {subscription && subscription.subscription_status === 'active' && (
                  <div className="pt-3 border-t border-gray-200">
                    <Button
                      onClick={openStripePortal}
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Manage Billing
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Enhanced Usage Analytics */}
              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-heading text-lg text-gray-800">This Month</h3>
                </div>

                {monthlyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Stories Created</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-800">{monthlyStats.storiesCreated}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">Audio Generated</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-800">{monthlyStats.audioGenerated}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Total Plays</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-800">{monthlyStats.totalPlays}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-pink-500" />
                        <span className="text-sm text-gray-600">Engagement</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-800">{monthlyStats.engagement}%</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => navigate('/analytics')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    View Detailed Analytics
                  </Button>
                </div>
              </motion.div>

              {/* Enhanced Quick Actions */}
              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="font-heading text-lg text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/text-to-speech')}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Create New Story
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/analytics')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/security')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Security Settings
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/pricing')}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>
              </motion.div>

              {/* Notifications */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
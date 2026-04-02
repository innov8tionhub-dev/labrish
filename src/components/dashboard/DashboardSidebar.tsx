import React from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Settings,
  Volume2,
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  CreditCard,
  ExternalLink,
  Play,
  Users,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonthlyStats } from '@/hooks/useDashboardStats';

interface UsageStats {
  current: number;
  limit: number;
  percentage: number;
}

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

interface DashboardSidebarProps {
  aiAssistStats: UsageStats;
  generationStats: UsageStats;
  subscription: SubscriptionData | null;
  subscriptionLabel: string;
  statusColor: string;
  monthlyStats: MonthlyStats;
  monthlyLoading: boolean;
  onNavigate: (path: string) => void;
  onOpenBilling: () => void;
  track: (event: string, data?: Record<string, unknown>) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  aiAssistStats,
  generationStats,
  subscription,
  subscriptionLabel,
  statusColor,
  monthlyStats,
  monthlyLoading,
  onNavigate,
  onOpenBilling,
  track,
}) => {
  const isFree = subscriptionLabel === 'Free';

  return (
    <div className="space-y-6">
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-cyan-600" />
          <h3 className="font-heading text-lg text-gray-800">AI Assists</h3>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Used this month</span>
              <span className="font-medium text-gray-800">{aiAssistStats.current}/{aiAssistStats.limit}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={aiAssistStats.current} aria-valuemin={0} aria-valuemax={aiAssistStats.limit} aria-label="AI Assists usage">
              <div
                className={`h-full rounded-full ${
                  aiAssistStats.percentage >= 100
                    ? 'bg-red-500'
                    : aiAssistStats.percentage >= 80
                    ? 'bg-yellow-500'
                    : 'bg-gradient-to-r from-cyan-500 to-teal-500'
                }`}
                style={{ width: `${aiAssistStats.percentage}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-gray-500">
            {isFree ? (
              <span>Includes story generation, expansion, dialect help, and more!</span>
            ) : (
              <span>Pro includes 50 AI assists per month for all features</span>
            )}
          </div>
        </div>

        {isFree && aiAssistStats.percentage >= 80 && (
          <Button
            onClick={() => onNavigate('/pricing')}
            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
            size="sm"
          >
            Upgrade for More AI Assists
          </Button>
        )}
      </motion.div>

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
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={generationStats.current} aria-valuemin={0} aria-valuemax={generationStats.limit} aria-label="TTS generations usage">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${generationStats.percentage}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-gray-500">
            {isFree ? (
              <span>Upgrade to Pro for 40 generations per month</span>
            ) : (
              <span>Pro subscription includes 40 generations per month</span>
            )}
          </div>
        </div>

        {isFree && (
          <Button
            onClick={() => onNavigate('/pricing')}
            className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            size="sm"
          >
            Upgrade to Pro
          </Button>
        )}
      </motion.div>

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
            <p className={`text-lg font-semibold ${statusColor}`}>
              {subscriptionLabel}
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
                onNavigate('/pricing');
              }}
              size="sm"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              Upgrade Now
            </Button>
          </div>
        )}

        {subscription && subscription.subscription_status === 'active' && (
          <div className="pt-3 border-t border-gray-200">
            <Button
              onClick={onOpenBilling}
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
              aria-label="Manage billing in Stripe"
            >
              <CreditCard className="w-4 h-4" />
              Manage Billing
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        )}
      </motion.div>

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
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" role="status" aria-label="Loading monthly stats" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Stories Created</span>
              </div>
              <span className="font-semibold text-gray-800">{monthlyStats.storiesCreated}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-teal-500" />
                <span className="text-sm text-gray-600">Audio Generated</span>
              </div>
              <span className="font-semibold text-gray-800">{monthlyStats.audioGenerated}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Total Plays</span>
              </div>
              <span className="font-semibold text-gray-800">{monthlyStats.totalPlays}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-500" />
                <span className="text-sm text-gray-600">Engagement</span>
              </div>
              <span className="font-semibold text-gray-800">{monthlyStats.engagement}%</span>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            onClick={() => onNavigate('/analytics')}
            variant="outline"
            size="sm"
            className="w-full"
          >
            View Detailed Analytics
          </Button>
        </div>
      </motion.div>

      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3 className="font-heading text-lg text-gray-800 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate('/text-to-speech')}>
            <Volume2 className="w-4 h-4 mr-2" />
            Create New Story
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate('/analytics')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate('/security')}>
            <Settings className="w-4 h-4 mr-2" />
            Security Settings
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate('/pricing')}>
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardSidebar;

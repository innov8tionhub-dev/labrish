import React from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Crown, LogOut, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardStats } from '@/hooks/useDashboardStats';

interface DashboardHeaderProps {
  user: User;
  dashboardStats: DashboardStats;
  statsLoading: boolean;
  aiAssistStats: { current: number; limit: number };
  subscriptionLabel: string;
  statusColor: string;
  isOnline: boolean;
  queueSize: number;
  onSignOut: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  dashboardStats,
  statsLoading,
  aiAssistStats,
  subscriptionLabel,
  statusColor,
  isOnline,
  queueSize,
  onSignOut,
}) => {
  return (
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
              <span className={`text-sm font-medium ${statusColor}`}>
                {subscriptionLabel}
              </span>
              {!isOnline && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  Offline ({queueSize} queued)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
            <div className="text-2xl font-bold text-teal-600">{dashboardStats.voicesAvailable}</div>
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
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600">{aiAssistStats.current}/{aiAssistStats.limit}</div>
            <div className="text-xs text-gray-500">AI Assists</div>
            <div className="text-xs text-cyan-600">
              {aiAssistStats.current >= aiAssistStats.limit ? 'Limit reached' : `${aiAssistStats.limit - aiAssistStats.current} left`}
            </div>
          </div>
        </div>

        <Button
          onClick={onSignOut}
          variant="outline"
          className="flex items-center gap-2 self-start lg:self-center"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;

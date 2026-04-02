import React from 'react';
import { motion } from 'framer-motion';
import { Book, Volume2, Mic, Share2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/common/EmptyState';
import { RecentActivity } from '@/hooks/useDashboardStats';

interface DashboardActivitiesProps {
  activities: RecentActivity[];
  loading: boolean;
  onCreateFirst: () => void;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'story_created': return <Book className="w-4 h-4 text-emerald-600" />;
    case 'audio_generated': return <Volume2 className="w-4 h-4 text-blue-600" />;
    case 'voice_trained': return <Mic className="w-4 h-4 text-teal-600" />;
    case 'story_shared': return <Share2 className="w-4 h-4 text-pink-600" />;
    default: return <Activity className="w-4 h-4 text-gray-600" />;
  }
};

const DashboardActivities: React.FC<DashboardActivitiesProps> = ({
  activities,
  loading,
  onCreateFirst,
}) => {
  return (
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
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" role="status" aria-label="Loading activities" />
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No Activities Yet"
            description="Start creating stories with Caribbean voices to see your activity timeline here. Your journey begins with a single story!"
            actionLabel="Create First Story"
            onAction={onCreateFirst}
            secondaryActionLabel="Explore Voices"
            onSecondaryAction={onCreateFirst}
          />
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map((activity, index) => (
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
                            <span key={key}>&#x2022; {key}: {String(value)}</span>
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
  );
};

export default DashboardActivities;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  Bookmark, 
  BarChart3, 
  Settings, 
  Plus,
  Clock,
  Star,
  TrendingUp,
  Users,
  Zap,
  Bell,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/lib/analytics';

interface QuickLink {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
  badge?: string;
  status: 'active' | 'inactive' | 'pending' | 'loading';
  lastUsed?: string;
  usageCount: number;
  notifications?: number;
  progress?: number;
  isNew?: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface EnhancedQuickLinksProps {
  onNavigate: (section: string) => void;
}

const EnhancedQuickLinks: React.FC<EnhancedQuickLinksProps> = ({ onNavigate }) => {
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { track } = useAnalytics();

  useEffect(() => {
    loadQuickLinksData();
  }, []);

  const loadQuickLinksData = async () => {
    setLoading(true);
    
    // Simulate API call to fetch real-time data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const links: QuickLink[] = [
      {
        id: 'recent-activities',
        title: 'Recent Activities',
        description: 'View your latest actions and creations',
        icon: <Activity className="w-6 h-6" />,
        action: () => {
          track('quick_link_clicked', { link: 'recent_activities' });
          onNavigate('activities');
        },
        color: 'from-emerald-500 to-teal-500',
        status: 'active',
        lastUsed: '2 hours ago',
        usageCount: 15,
        notifications: 3,
        priority: 'high'
      },
      {
        id: 'favorite-tools',
        title: 'Text-to-Speech Studio',
        description: 'Quick access to Text-to-Speech Studio',
        icon: <Heart className="w-6 h-6" />,
        action: () => {
          track('quick_link_clicked', { link: 'favorite_tools' });
          onNavigate('tools');
        },
        color: 'from-pink-500 to-rose-500',
        status: 'active',
        lastUsed: '5 hours ago',
        usageCount: 32,
        badge: 'Popular',
        priority: 'high'
      },
      {
        id: 'saved-templates',
        title: 'Saved Templates',
        description: 'Access your story templates and presets',
        icon: <Bookmark className="w-6 h-6" />,
        action: () => {
          track('quick_link_clicked', { link: 'saved_templates' });
          onNavigate('templates');
        },
        color: 'from-blue-500 to-cyan-500',
        status: 'active',
        lastUsed: '1 day ago',
        usageCount: 8,
        priority: 'medium'
      },
      {
        id: 'analytics-overview',
        title: 'Analytics Overview',
        description: 'Detailed insights into your content performance',
        icon: <BarChart3 className="w-6 h-6" />,
        action: () => {
          track('quick_link_clicked', { link: 'analytics_overview' });
          onNavigate('analytics');
        },
        color: 'from-purple-500 to-indigo-500',
        status: 'active',
        lastUsed: '3 hours ago',
        usageCount: 12,
        progress: 75,
        priority: 'high'
      },
      {
        id: 'user-settings',
        title: 'User Settings',
        description: 'Customize your preferences and account',
        icon: <Settings className="w-6 h-6" />,
        action: () => {
          track('quick_link_clicked', { link: 'user_settings' });
          onNavigate('settings');
        },
        color: 'from-gray-500 to-slate-500',
        status: 'active',
        lastUsed: '1 week ago',
        usageCount: 5,
        priority: 'medium'
      },
      {
        id: 'voice-training',
        title: 'Voice Training',
        description: 'Train new voices or improve existing ones',
        icon: <Zap className="w-6 h-6" />,
        action: () => {
          track('quick_link_clicked', { link: 'voice_training' });
          onNavigate('voice-training');
        },
        color: 'from-amber-500 to-orange-500',
        status: 'pending',
        lastUsed: 'Never',
        usageCount: 0,
        badge: 'New',
        isNew: true,
        priority: 'high'
      }
    ];

    setQuickLinks(links);
    setLoading(false);
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      case 'inactive':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      case 'pending':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
      case 'loading':
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200';
      case 'medium': return 'border-yellow-200';
      case 'low': return 'border-green-200';
      default: return 'border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-200 rounded mb-4" />
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-3 bg-gray-200 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl text-gray-800">Quick Links</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadQuickLinksData()}
          className="flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link, index) => (
          <motion.div
            key={link.id}
            className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 ${getPriorityColor(link.priority)} p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden`}
            onClick={link.action}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                link.action();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${link.title}: ${link.description}`}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            {/* New Badge */}
            {link.isNew && (
              <motion.div
                className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                NEW
              </motion.div>
            )}

            {/* Notification Badge */}
            {link.notifications && link.notifications > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                {link.notifications}
              </motion.div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${link.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                {link.icon}
              </div>
              <div className="flex items-center gap-2">
                {getStatusIndicator(link.status)}
                {link.badge && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                    {link.badge}
                  </span>
                )}
              </div>
            </div>

            <h3 className="font-heading text-lg text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
              {link.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {link.description}
            </p>

            {/* Progress Bar */}
            {link.progress !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{link.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full bg-gradient-to-r ${link.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${link.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Used {link.usageCount} times</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{link.lastUsed}</span>
              </div>
            </div>

            {/* Hover Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              initial={false}
            />
          </motion.div>
        ))}
      </div>

      {/* Add New Quick Link */}
      <motion.div
        className="mt-6 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-300 cursor-pointer group"
        onClick={() => {
          track('add_quick_link_clicked');
          // Handle adding new quick link
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center justify-center gap-3 text-gray-500 group-hover:text-emerald-600">
          <Plus className="w-6 h-6" />
          <span className="font-medium">Add Custom Quick Link</span>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedQuickLinks;
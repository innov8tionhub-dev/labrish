import React, { useEffect, useState } from 'react';
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
  Search,
  Plus,
  Play,
  FileText,
  BarChart3,
  Clock,
  Star,
  Zap,
  Volume2,
  Download,
  Share2,
  Edit,
  Trash2,
  Filter,
  TrendingUp,
  Activity,
  Calendar,
  Bookmark
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
  badge?: string;
}

interface RecentProject {
  id: string;
  title: string;
  type: 'story' | 'voice' | 'audio';
  lastModified: string;
  status: 'completed' | 'in-progress' | 'draft';
  duration?: string;
}

interface UsageStats {
  storiesCreated: number;
  audioGenerated: number;
  voicesUsed: number;
  totalListens: number;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [usageStats, setUsageStats] = useState<UsageStats>({
    storiesCreated: 12,
    audioGenerated: 45,
    voicesUsed: 8,
    totalListens: 234
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await fetchSubscription();
      }
      setLoading(false);
    };

    getUser();
  }, []);

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

  const handleSignOut = async () => {
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

  const quickActions: QuickAction[] = [
    {
      id: 'create-story',
      title: 'Create New Story',
      description: 'Write and narrate a new Caribbean story',
      icon: <Plus className="w-6 h-6" />,
      action: () => navigate('/text-to-speech'),
      color: 'from-emerald-500 to-teal-500',
      badge: 'Popular'
    },
    {
      id: 'tts-studio',
      title: 'TTS Studio',
      description: 'Convert text to speech with AI voices',
      icon: <Mic className="w-6 h-6" />,
      action: () => navigate('/text-to-speech'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'voice-library',
      title: 'Voice Library',
      description: 'Browse and preview Caribbean voices',
      icon: <Volume2 className="w-6 h-6" />,
      action: () => navigate('/text-to-speech'),
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'story-library',
      title: 'Story Library',
      description: 'Manage your story collection',
      icon: <Book className="w-6 h-6" />,
      action: () => navigate('/text-to-speech'),
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View your usage and performance',
      icon: <BarChart3 className="w-6 h-6" />,
      action: () => {},
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Customize your preferences',
      icon: <Settings className="w-6 h-6" />,
      action: () => {},
      color: 'from-gray-500 to-slate-500'
    }
  ];

  const recentProjects: RecentProject[] = [
    {
      id: '1',
      title: 'Anansi and the Golden Mango',
      type: 'story',
      lastModified: '2 hours ago',
      status: 'completed',
      duration: '3:45'
    },
    {
      id: '2',
      title: 'Caribbean Sunset Meditation',
      type: 'audio',
      lastModified: '1 day ago',
      status: 'in-progress'
    },
    {
      id: '3',
      title: 'Jamaican Folklore Collection',
      type: 'story',
      lastModified: '3 days ago',
      status: 'draft'
    },
    {
      id: '4',
      title: 'Island Breeze Voice Training',
      type: 'voice',
      lastModified: '1 week ago',
      status: 'completed'
    }
  ];

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'story': return <Book className="w-4 h-4" />;
      case 'voice': return <Mic className="w-4 h-4" />;
      case 'audio': return <Volume2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      draft: 'bg-gray-100 text-gray-700'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
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
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{usageStats.storiesCreated}</div>
                  <div className="text-xs text-gray-500">Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{usageStats.audioGenerated}</div>
                  <div className="text-xs text-gray-500">Audio Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{usageStats.voicesUsed}</div>
                  <div className="text-xs text-gray-500">Voices</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{usageStats.totalListens}</div>
                  <div className="text-xs text-gray-500">Listens</div>
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
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="font-heading text-2xl text-gray-800 mb-6">Quick Actions</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.id}
                      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={action.action}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                          {action.icon}
                        </div>
                        {action.badge && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading text-lg text-gray-800 mb-2">{action.title}</h3>
                      <p className="text-gray-600 text-sm">{action.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Projects */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-2xl text-gray-800">Recent Projects</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search projects..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      />
                    </div>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="story">Stories</option>
                      <option value="voice">Voices</option>
                      <option value="audio">Audio</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {recentProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        className="p-6 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                              {getProjectIcon(project.type)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">{project.title}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-500 capitalize">{project.type}</span>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-500">{project.lastModified}</span>
                                {project.duration && (
                                  <>
                                    <span className="text-sm text-gray-400">•</span>
                                    <span className="text-sm text-gray-500">{project.duration}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(project.status)}`}>
                              {project.status.replace('-', ' ')}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Subscription Status */}
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
                      onClick={() => navigate('/pricing')}
                      size="sm"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Usage Analytics */}
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
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Stories Created</span>
                    </div>
                    <span className="font-semibold text-gray-800">8</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Audio Generated</span>
                    </div>
                    <span className="font-semibold text-gray-800">24</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Total Plays</span>
                    </div>
                    <span className="font-semibold text-gray-800">156</span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="font-heading text-lg text-gray-800 mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Saved Templates
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Scheduled Posts
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Star className="w-4 h-4 mr-2" />
                    Favorites
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
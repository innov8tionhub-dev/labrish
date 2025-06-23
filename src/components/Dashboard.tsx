import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Crown, LogOut, Settings, User as UserIcon, Mic, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConvAIWidget from './ConvAIWidget';
import InteractiveStory from './InteractiveStory';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'story'>('chat');
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-200/50 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="font-heading text-3xl text-gray-800">Welcome back!</h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Subscription Status */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-heading text-lg text-gray-800">Plan</h2>
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
              </div>

              {/* Navigation */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50">
                <h3 className="font-heading text-lg text-gray-800 mb-4">Features</h3>
                <div className="space-y-2">
                  <Button
                    variant={activeTab === 'chat' ? 'default' : 'outline'}
                    className={`w-full justify-start ${
                      activeTab === 'chat' 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600' 
                        : ''
                    }`}
                    onClick={() => setActiveTab('chat')}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Voice Chat
                  </Button>
                  <Button
                    variant={activeTab === 'story' ? 'default' : 'outline'}
                    className={`w-full justify-start ${
                      activeTab === 'story' 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600' 
                        : ''
                    }`}
                    onClick={() => setActiveTab('story')}
                  >
                    <Book className="w-4 h-4 mr-2" />
                    Interactive Stories
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50">
                <h3 className="font-heading text-lg text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Browse Voice Library
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Train Custom Voice
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'chat' ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-200/50">
                  <h3 className="font-heading text-2xl text-gray-800 mb-6">Caribbean Voice Chat</h3>
                  <div className="space-y-4">
                    <p className="text-gray-600 mb-6">
                      Experience authentic Caribbean voices powered by AI. Start a conversation and explore the rich culture and storytelling traditions of the Caribbean.
                    </p>
                    <ConvAIWidget 
                      agentId="agent_01jyd8m2mfedx8z5d030pp2nx0"
                      className="min-h-[500px] w-full border border-emerald-200 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <InteractiveStory />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
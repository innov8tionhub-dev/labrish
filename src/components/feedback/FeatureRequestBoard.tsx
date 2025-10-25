import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  ThumbsUp,
  Clock,
  CheckCircle,
  Circle,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Feedback,
  getPublicFeatureRequests,
  voteFeedback,
  unvoteFeedback,
  getUserVotes
} from '@/lib/feedback';
import { useToast } from '@/components/common/Toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

const FeatureRequestBoard: React.FC = () => {
  const [requests, setRequests] = useState<Feedback[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');

  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    loadFeatureRequests();
    loadUserVotes();
  }, []);

  const loadFeatureRequests = async () => {
    try {
      const data = await getPublicFeatureRequests(100);
      setRequests(data);
    } catch (error: any) {
      console.error('Failed to load feature requests:', error);
      showError('Loading failed', 'Could not load feature requests');
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async () => {
    try {
      const votes = await getUserVotes();
      setUserVotes(votes);
    } catch (error) {
      console.error('Failed to load user votes:', error);
    }
  };

  const handleVote = async (feedbackId: string) => {
    try {
      if (userVotes.includes(feedbackId)) {
        await unvoteFeedback(feedbackId);
        setUserVotes(prev => prev.filter(id => id !== feedbackId));
        setRequests(prev =>
          prev.map(req =>
            req.id === feedbackId ? { ...req, votes: req.votes - 1 } : req
          )
        );
        showSuccess('Vote removed', 'Your vote has been removed');
      } else {
        await voteFeedback(feedbackId);
        setUserVotes(prev => [...prev, feedbackId]);
        setRequests(prev =>
          prev.map(req =>
            req.id === feedbackId ? { ...req, votes: req.votes + 1 } : req
          )
        );
        showSuccess('Vote added', 'Thank you for voting!');
      }
    } catch (error: any) {
      showError('Vote failed', error.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'planned':
        return <Circle className="w-5 h-5 text-purple-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'planned':
        return 'bg-purple-100 text-purple-700';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredRequests = requests
    .filter(req => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (searchQuery && !req.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !req.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'votes') {
        return b.votes - a.votes;
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-8 h-8 text-emerald-600" />
              <h1 className="text-4xl font-heading text-gray-800">Feature Requests</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Vote on features you'd like to see. Your feedback shapes the future of Labrish!
            </p>
          </motion.div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search feature requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="reviewing">Under Review</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="votes">Most Voted</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <EmptyState
              icon={Lightbulb}
              title="No feature requests found"
              description="Be the first to suggest a feature!"
              actionLabel="Submit Feedback"
              onAction={() => {}}
            />
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => handleVote(request.id)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                          userVotes.includes(request.id)
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsUp className={`w-5 h-5 ${userVotes.includes(request.id) ? 'fill-current' : ''}`} />
                        <span className="font-semibold text-sm">{request.votes}</span>
                      </button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-xl font-semibold text-gray-800">{request.title}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusLabel(request.status)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3">{request.content}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{request.category.replace('_', ' ')}</span>
                        {request.admin_response && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">Admin Response</span>
                          </>
                        )}
                      </div>

                      {request.admin_response && (
                        <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded">
                          <p className="text-sm font-medium text-emerald-700 mb-1">Response from Team:</p>
                          <p className="text-sm text-gray-700">{request.admin_response}</p>
                          {request.responded_at && (
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(request.responded_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureRequestBoard;

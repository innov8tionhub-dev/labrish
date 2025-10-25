import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Star,
  Bug,
  Lightbulb,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/common/Toast';

interface FeedbackWidgetProps {
  defaultType?: 'feedback' | 'bug' | 'feature_request';
  context?: Record<string, any>;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  defaultType = 'feedback',
  context = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'feedback' | 'bug' | 'feature_request'>(defaultType);
  const [category, setCategory] = useState<string>('other');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [email, setEmail] = useState('');

  const { success: showSuccess, error: showError } = useToast();

  const feedbackTypes = [
    { value: 'feedback', label: 'General Feedback', icon: MessageSquare, color: 'blue' },
    { value: 'bug', label: 'Report Bug', icon: Bug, color: 'red' },
    { value: 'feature_request', label: 'Feature Request', icon: Lightbulb, color: 'purple' }
  ];

  const categories = [
    { value: 'ui_ux', label: 'User Interface' },
    { value: 'performance', label: 'Performance' },
    { value: 'content', label: 'Content Creation' },
    { value: 'voice_quality', label: 'Voice Quality' },
    { value: 'pricing', label: 'Pricing' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'mobile', label: 'Mobile Experience' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showError('Required fields', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showError('Authentication required', 'Please log in to submit feedback');
        setIsSubmitting(false);
        return;
      }

      const sentiment = rating ? (rating >= 8 ? 'positive' : rating >= 5 ? 'neutral' : 'negative') : 'neutral';

      const feedbackData = {
        user_id: user.id,
        type: feedbackType,
        category,
        title: title.trim(),
        content: content.trim(),
        rating: rating || null,
        sentiment,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        metadata: {
          ...context,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          viewport_size: `${window.innerWidth}x${window.innerHeight}`,
          timestamp: new Date().toISOString()
        },
        is_public: feedbackType === 'feature_request'
      };

      const { error } = await supabase
        .from('user_feedback')
        .insert([feedbackData]);

      if (error) throw error;

      showSuccess(
        'Thank you!',
        'Your feedback has been submitted successfully'
      );

      setTitle('');
      setContent('');
      setRating(null);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Feedback submission error:', error);
      showError('Submission failed', error.message || 'Please try again later');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="font-medium">Feedback</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-heading text-gray-800">Share Your Feedback</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close feedback form"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What would you like to share?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {feedbackTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = feedbackType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFeedbackType(type.value as any)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? `border-${type.color}-500 bg-${type.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? `text-${type.color}-600` : 'text-gray-400'}`} />
                          <p className={`text-sm font-medium ${isSelected ? `text-${type.color}-700` : 'text-gray-600'}`}>
                            {type.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {feedbackType === 'feedback' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How would you rate your experience? (1-10)
                    </label>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRating(num)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            rating === num
                              ? 'bg-emerald-500 text-white scale-110'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of your feedback"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{title.length}/200 characters</p>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Please provide as much detail as possible..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    required
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{content.length}/2000 characters</p>
                </div>

                {feedbackType === 'feature_request' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">
                        Feature requests are made public so other users can vote on them. Your name will be visible.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackWidget;

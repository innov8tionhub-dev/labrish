import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Tip {
  id: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  category: 'getting-started' | 'pro-tip' | 'feature' | 'optimization';
}

interface PersonalizedTipsProps {
  userStats: {
    storiesCreated: number;
    audioGenerated: number;
    totalPlays: number;
  };
  onNavigate: (path: string) => void;
}

const PersonalizedTips: React.FC<PersonalizedTipsProps> = ({ userStats, onNavigate }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);

  useEffect(() => {
    const allTips: Tip[] = [];

    if (userStats.storiesCreated === 0) {
      allTips.push({
        id: 'first-story',
        title: 'Create Your First Story',
        description: 'Start your Caribbean storytelling journey by creating your first voice-over. It only takes a few minutes!',
        action: {
          label: 'Get Started',
          onClick: () => onNavigate('/text-to-speech')
        },
        category: 'getting-started'
      });
    }

    if (userStats.storiesCreated > 0 && userStats.storiesCreated < 5) {
      allTips.push({
        id: 'explore-voices',
        title: 'Explore Different Voices',
        description: 'Try different Caribbean voices to find the perfect match for your story\'s tone and character.',
        action: {
          label: 'Browse Voices',
          onClick: () => onNavigate('/text-to-speech')
        },
        category: 'feature'
      });
    }

    if (userStats.totalPlays === 0 && userStats.storiesCreated > 0) {
      allTips.push({
        id: 'share-story',
        title: 'Share Your Stories',
        description: 'Make your stories public to reach a wider audience and connect with other Caribbean storytellers.',
        action: {
          label: 'View Library',
          onClick: () => onNavigate('/text-to-speech')
        },
        category: 'optimization'
      });
    }

    allTips.push(
      {
        id: 'voice-settings',
        title: 'Fine-Tune Voice Settings',
        description: 'Adjust stability, clarity, and style settings to get the perfect voice output for your content.',
        category: 'pro-tip'
      },
      {
        id: 'keyboard-shortcuts',
        title: 'Use Keyboard Shortcuts',
        description: 'Speed up your workflow with shortcuts: Space to play/pause, Ctrl+S to save, and more!',
        category: 'pro-tip'
      },
      {
        id: 'analytics',
        title: 'Track Your Performance',
        description: 'Use the analytics dashboard to understand which stories resonate most with your audience.',
        action: {
          label: 'View Analytics',
          onClick: () => onNavigate('/analytics')
        },
        category: 'feature'
      }
    );

    const activeTips = allTips.filter(tip => !dismissedTips.includes(tip.id));
    setTips(activeTips);
  }, [userStats, dismissedTips, onNavigate]);

  const handleDismiss = () => {
    if (tips[currentTipIndex]) {
      setDismissedTips([...dismissedTips, tips[currentTipIndex].id]);
    }
  };

  const handleNext = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  if (tips.length === 0) return null;

  const currentTip = tips[currentTipIndex];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'getting-started':
        return 'from-blue-500 to-cyan-500';
      case 'pro-tip':
        return 'from-purple-500 to-pink-500';
      case 'feature':
        return 'from-emerald-500 to-teal-500';
      case 'optimization':
        return 'from-orange-500 to-amber-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'getting-started':
      case 'pro-tip':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={`h-1 bg-gradient-to-r ${getCategoryColor(currentTip.category)}`} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${getCategoryColor(currentTip.category)} rounded-lg flex items-center justify-center text-white`}>
              {getCategoryIcon(currentTip.category)}
            </div>
            <div>
              <h3 className="font-heading text-lg text-gray-800">{currentTip.title}</h3>
              <span className="text-xs text-gray-500 capitalize">{currentTip.category.replace('-', ' ')}</span>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss tip"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={currentTip.id}
            className="text-gray-600 mb-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentTip.description}
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          {currentTip.action ? (
            <Button
              onClick={currentTip.action.onClick}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              {currentTip.action.label}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <div />
          )}

          {tips.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {currentTipIndex + 1} / {tips.length}
              </span>
              <Button
                onClick={handleNext}
                variant="outline"
                size="sm"
                aria-label="Next tip"
              >
                Next Tip
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PersonalizedTips;

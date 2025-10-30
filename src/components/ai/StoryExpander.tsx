import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Loader2, Undo, Check, X } from 'lucide-react';
import { expandStory } from '@/lib/aiAssistant';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryExpanderProps {
  originalText: string;
  onAcceptExpansion: (expandedText: string) => void;
  onCancel: () => void;
}

export const StoryExpander: React.FC<StoryExpanderProps> = ({
  originalText,
  onAcceptExpansion,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [expandedText, setExpandedText] = useState<string>('');
  const [targetLength, setTargetLength] = useState<number>(500);
  const [error, setError] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);

  const handleExpand = async () => {
    if (!originalText.trim()) {
      setError('No text to expand');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await expandStory(originalText, { length: targetLength });

      if (response.limitReached) {
        setError(response.message || 'AI assist limit reached');
        return;
      }

      if (!response.success || !response.output) {
        throw new Error(response.error || 'Failed to expand story');
      }

      setExpandedText(response.output);
      setShowComparison(true);
    } catch (err: any) {
      setError(err.message || 'Failed to expand story');
      console.error('Story expansion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    onAcceptExpansion(expandedText);
    setShowComparison(false);
  };

  const handleRetry = () => {
    setExpandedText('');
    setShowComparison(false);
    setError('');
  };

  if (showComparison && expandedText) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between">
            <h3 className="font-heading text-xl text-white flex items-center gap-2">
              <Maximize2 className="w-5 h-5" />
              Story Expansion Comparison
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleRetry}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Undo className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button
                size="sm"
                onClick={onCancel}
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">Original ({originalText.length} chars)</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-full">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{originalText}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-emerald-600">Expanded ({expandedText.length} chars)</h4>
                <span className="text-xs text-gray-500">
                  {Math.round((expandedText.length / originalText.length) * 100)}% increase
                </span>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 h-full">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{expandedText}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <p className="text-sm text-gray-600">
              Review the expansion and accept or retry with different settings
            </p>
            <div className="flex gap-3">
              <Button
                onClick={onCancel}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Accept Expansion
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-emerald-200 p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
          <Maximize2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-heading text-lg text-gray-800">Expand Story</h3>
          <p className="text-xs text-gray-500">Transform your outline into a full narrative</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Length (words)
        </label>
        <div className="flex gap-2">
          {[300, 500, 800, 1000].map((length) => (
            <Button
              key={length}
              size="sm"
              variant={targetLength === length ? 'default' : 'outline'}
              onClick={() => setTargetLength(length)}
              disabled={loading}
              className={targetLength === length ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {length}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleExpand}
          disabled={loading || !originalText.trim()}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Expanding Story...
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 mr-2" />
              Expand Story
            </>
          )}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={loading}
        >
          Cancel
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Works best with bullet points, short outlines, or brief paragraphs.
          The AI will maintain your voice while adding Caribbean cultural details and atmosphere.
        </p>
      </div>
    </div>
  );
};

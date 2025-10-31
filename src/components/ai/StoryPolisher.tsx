import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { polishStory } from '@/lib/aiAssistant';
import { motion, AnimatePresence } from 'framer-motion';

interface StorySuggestion {
  type: 'pacing' | 'character' | 'dialogue' | 'cultural' | 'grammar';
  severity: 'low' | 'medium' | 'high';
  location: string;
  issue: string;
  suggestion: string;
  fix?: string;
}

interface StoryAnalysis {
  overall_score: number;
  readability: string;
  suggestions: StorySuggestion[];
  voice_match?: string;
}

interface StoryPolisherProps {
  text: string;
  onApplyFix?: (fix: string, location: string) => void;
}

export const StoryPolisher: React.FC<StoryPolisherProps> = ({ text, onApplyFix }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<StoryAnalysis | null>(null);
  const [error, setError] = useState<string>('');

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text first');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await polishStory(text);

      if (response.limitReached) {
        setError(response.message || 'AI assist limit reached');
        return;
      }

      if (!response.success || !response.output) {
        throw new Error(response.error || 'Failed to analyze story');
      }

      const outputText = typeof response.output === 'string' ? response.output : JSON.stringify(response.output);
      const jsonMatch = outputText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedAnalysis = JSON.parse(jsonMatch[0]);
        setAnalysis(parsedAnalysis);
        setIsOpen(true);
      } else {
        throw new Error('Invalid response format. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to polish story');
      console.error('Story polish error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pacing': return '⏱️';
      case 'character': return '👤';
      case 'dialogue': return '💬';
      case 'cultural': return '🌴';
      case 'grammar': return '📝';
      default: return '📋';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-purple-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-purple-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-heading text-lg text-gray-800">Polish Story</h3>
            <p className="text-xs text-gray-500">Get AI-powered improvement suggestions</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-purple-200"
          >
            <div className="p-6 space-y-4">
              <Button
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Story...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze & Polish
                  </>
                )}
              </Button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-800 mb-1">Story Health Score</h4>
                        <p className="text-sm text-gray-600">{analysis.readability}</p>
                      </div>
                      <div className={`text-4xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                        {analysis.overall_score.toFixed(1)}/10
                      </div>
                    </div>

                    {analysis.voice_match && (
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          <strong>Recommended Voice:</strong> {analysis.voice_match}
                        </p>
                      </div>
                    )}
                  </div>

                  {analysis.suggestions && analysis.suggestions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-purple-600" />
                        Improvement Suggestions ({analysis.suggestions.length})
                      </h4>

                      {analysis.suggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`rounded-lg p-4 border ${getSeverityColor(suggestion.severity)}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getTypeIcon(suggestion.type)}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium uppercase tracking-wide">
                                  {suggestion.type}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white border">
                                  {suggestion.location}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  suggestion.severity === 'high' ? 'bg-red-100 text-red-700' :
                                  suggestion.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {suggestion.severity} priority
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-800 mb-2">{suggestion.issue}</p>
                              <p className="text-sm text-gray-700 mb-3">{suggestion.suggestion}</p>
                              {suggestion.fix && (
                                <div className="bg-white/50 rounded p-3 border border-dashed">
                                  <p className="text-xs font-medium text-gray-600 mb-1">Suggested Fix:</p>
                                  <p className="text-sm text-gray-800 italic">"{suggestion.fix}"</p>
                                  {onApplyFix && (
                                    <Button
                                      size="sm"
                                      onClick={() => onApplyFix(suggestion.fix!, suggestion.location)}
                                      className="mt-2 bg-purple-600 hover:bg-purple-700"
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Apply Fix
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {(!analysis.suggestions || analysis.suggestions.length === 0) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                      <h4 className="font-medium text-green-800 mb-2">Great Work!</h4>
                      <p className="text-sm text-green-700">
                        Your story looks good! No major improvements needed.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {!analysis && !loading && !error && (
                <div className="text-center py-8 text-gray-400">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Click "Analyze & Polish" to get improvement suggestions</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2, CheckCircle, X } from 'lucide-react';
import { getDialectSuggestions, DialectSuggestion } from '@/lib/aiAssistant';
import { motion, AnimatePresence } from 'framer-motion';

interface DialectEnhancerProps {
  text: string;
  onApplySuggestion: (original: string, replacement: string) => void;
}

export const DialectEnhancer: React.FC<DialectEnhancerProps> = ({
  text,
  onApplySuggestion,
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<DialectSuggestion[]>([]);
  const [intensity, setIntensity] = useState<'mild' | 'moderate' | 'strong'>('moderate');
  const [error, setError] = useState<string>('');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  const handleEnhance = async () => {
    if (!text.trim()) {
      setError('Please enter some text first');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const response = await getDialectSuggestions(text, intensity);

      if (!response.success) {
        throw new Error(response.error || 'Failed to get suggestions');
      }

      setSuggestions(response.suggestions || []);

      if (!response.suggestions || response.suggestions.length === 0) {
        setError('No dialect suggestions found for this text');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to enhance dialect');
      console.error('Dialect enhancement error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (suggestion: DialectSuggestion) => {
    onApplySuggestion(suggestion.original, suggestion.replacement);
    setAppliedSuggestions(prev => new Set(prev).add(suggestion.original));
  };

  const handleReject = (original: string) => {
    setSuggestions(prev => prev.filter(s => s.original !== original));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dialect Intensity
          </label>
          <div className="flex gap-2">
            {(['mild', 'moderate', 'strong'] as const).map((level) => (
              <Button
                key={level}
                size="sm"
                variant={intensity === level ? 'default' : 'outline'}
                onClick={() => setIntensity(level)}
                disabled={loading}
                className={intensity === level ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {intensity === 'mild' && '10-20% Caribbean expressions'}
            {intensity === 'moderate' && '30-50% Caribbean dialect'}
            {intensity === 'strong' && '60%+ authentic Caribbean dialect'}
          </p>
        </div>

        <div className="pt-6">
          <Button
            onClick={handleEnhance}
            disabled={loading || !text.trim()}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 mr-2" />
                Enhance Dialect
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Dialect Suggestions ({suggestions.length})
            </h4>

            {suggestions.map((suggestion, index) => {
              const isApplied = appliedSuggestions.has(suggestion.original);

              return (
                <motion.div
                  key={`${suggestion.original}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-lg p-4 border ${
                    isApplied ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  } hover:border-emerald-300 transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-500 line-through">{suggestion.original}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-sm font-medium text-emerald-600">{suggestion.replacement}</span>
                        {isApplied && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{suggestion.explanation}</p>
                    </div>

                    {!isApplied && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApply(suggestion)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(suggestion.original)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info, Loader2, X, BookOpen } from 'lucide-react';
import { getCulturalContext, CulturalContext } from '@/lib/aiAssistant';
import { motion, AnimatePresence } from 'framer-motion';

interface CulturalContextPanelProps {
  onClose?: () => void;
}

export const CulturalContextPanel: React.FC<CulturalContextPanelProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<CulturalContext | null>(null);
  const [error, setError] = useState<string>('');
  const [source, setSource] = useState<string>('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a term to search');
      return;
    }

    setLoading(true);
    setError('');
    setContext(null);

    try {
      const response = await getCulturalContext(searchTerm);

      if (!response.success) {
        throw new Error(response.error || 'Failed to get cultural context');
      }

      setContext(response.context || null);
      setSource(response.source || 'unknown');

      if (!response.context) {
        setError('No information found for this term');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cultural context');
      console.error('Cultural context error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-heading text-lg text-white">Cultural Context</h3>
            <p className="text-xs text-blue-100">Learn about Caribbean terms and traditions</p>
          </div>
        </div>
        {onClose && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a Caribbean term..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <Button
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <AnimatePresence>
          {context && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-2xl font-heading text-gray-800 mb-1">{context.term}</h4>
                  {context.pronunciation && (
                    <p className="text-sm text-blue-600 italic">Pronunciation: {context.pronunciation}</p>
                  )}
                  {context.region && (
                    <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {context.region}
                    </span>
                  )}
                </div>
                {source && (
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    {source === 'built-in' && '📚 Built-in'}
                    {source === 'cache' && '💾 Cached'}
                    {source === 'ai' && '🤖 AI Generated'}
                  </span>
                )}
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Definition
                </h5>
                <p className="text-gray-700">{context.definition}</p>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-2">Cultural Significance</h5>
                <p className="text-gray-700 text-sm">{context.cultural_significance}</p>
              </div>

              {context.related_terms && context.related_terms.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Related Terms</h5>
                  <div className="flex flex-wrap gap-2">
                    {context.related_terms.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchTerm(term);
                          handleSearch();
                        }}
                        className="text-xs bg-white border border-blue-200 hover:border-blue-400 text-blue-700 px-3 py-1 rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && !context && !error && (
          <div className="text-center py-8">
            <Info className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">
              Search for Caribbean cultural terms like "ackee", "callaloo", "carnival", or "patois"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

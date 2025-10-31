import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { generatePrompts } from '@/lib/aiAssistant';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryPrompt {
  title: string;
  prompt: string;
  category: string;
}

interface StoryPromptGeneratorProps {
  onSelectPrompt: (prompt: string) => void;
  categories?: string[];
}

export const StoryPromptGenerator: React.FC<StoryPromptGeneratorProps> = ({
  onSelectPrompt,
  categories = ['Folklore', 'Food & Cooking', 'Traditions', 'Locations', 'Festivals', 'Historical', "Children's Tales"]
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState<StoryPrompt[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleGeneratePrompts = async (category?: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await generatePrompts(category);

      if (response.limitReached) {
        setError(response.message || 'AI assist limit reached. Upgrade to Pro for more assists!');
        return;
      }

      if (!response.success || !response.output) {
        throw new Error(response.error || 'Failed to generate prompts');
      }

      console.log('Full Response:', response);
      console.log('Response Output:', response.output);
      console.log('Output Type:', typeof response.output);

      let parsedPrompts;

      // If output is already an array, use it directly
      if (Array.isArray(response.output)) {
        console.log('Output is already an array');
        parsedPrompts = response.output;
      } else {
        // Otherwise, try to extract JSON from string
        const outputText = typeof response.output === 'string' ? response.output : JSON.stringify(response.output);
        console.log('AI Response Output Text:', outputText.substring(0, 500));

        const jsonMatch = outputText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          console.log('JSON Match Found:', jsonMatch[0].substring(0, 200) + '...');
          parsedPrompts = JSON.parse(jsonMatch[0]);
        } else {
          console.error('No JSON array found in output');
          throw new Error('Invalid response format. Please try again.');
        }
      }

      console.log('Parsed Prompts:', parsedPrompts);
      console.log('Number of prompts:', parsedPrompts.length);

      if (parsedPrompts && parsedPrompts.length > 0) {

        // Validate that prompts have the correct structure
        const validPrompts = parsedPrompts.filter((p: any, index: number) => {
          console.log(`Checking prompt ${index}:`, {
            hasTitle: !!p?.title,
            hasPrompt: !!p?.prompt,
            hasCategory: !!p?.category,
            titleType: typeof p?.title,
            promptType: typeof p?.prompt,
            categoryType: typeof p?.category,
          });

          const isValid = p &&
                         typeof p === 'object' &&
                         p.title &&
                         typeof p.title === 'string' &&
                         p.prompt &&
                         typeof p.prompt === 'string' &&
                         p.category &&
                         typeof p.category === 'string';

          if (!isValid) {
            console.warn('Invalid prompt structure:', p);
          }
          return isValid;
        });

        console.log('Valid Prompts Count:', validPrompts.length);
        console.log('Valid Prompts:', validPrompts);

        if (validPrompts.length === 0) {
          throw new Error('No valid prompts in response. Please try again.');
        }

        setPrompts(validPrompts);
      } else {
        throw new Error('No prompts found in response.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate prompts');
      console.error('Prompt generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSurpriseMe = () => {
    setSelectedCategory('');
    handleGeneratePrompts();
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    handleGeneratePrompts(category);
  };

  const handleUsePrompt = (prompt: string) => {
    onSelectPrompt(prompt);
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-emerald-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-emerald-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-heading text-lg text-gray-800">Story Ideas</h3>
            <p className="text-xs text-gray-500">Get AI-powered Caribbean story prompts</p>
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
            className="border-t border-emerald-200"
          >
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => handleCategorySelect(category)}
                    disabled={loading}
                    className={selectedCategory === category ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <Button
                onClick={handleSurpriseMe}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Surprise Me
                  </>
                )}
              </Button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {prompts && prompts.length > 0 && (
                <div className="space-y-3">
                  {prompts.map((prompt, index) => {
                    if (!prompt || !prompt.prompt || !prompt.title || !prompt.category) {
                      return null;
                    }

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200 hover:border-emerald-300 transition-all cursor-pointer group"
                        onClick={() => handleUsePrompt(prompt.prompt)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                                {prompt.category}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-800 mb-1">{prompt.title}</h4>
                            <p className="text-sm text-gray-600">{prompt.prompt}</p>
                          </div>
                          <Button
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 hover:bg-emerald-700"
                          >
                            Use
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {prompts && prompts.length === 0 && !loading && !error && (
                <div className="text-center py-8 text-gray-400">
                  <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a category or click "Surprise Me" to get started</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

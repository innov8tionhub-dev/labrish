import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Search, FileText, Clock, Star, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STORY_TEMPLATES, StoryTemplate, getTemplatesByCategory, searchTemplates } from '@/lib/storyTemplates';

interface StoryTemplateGalleryProps {
  onSelectTemplate: (template: StoryTemplate) => void;
  onClose: () => void;
}

const StoryTemplateGallery: React.FC<StoryTemplateGalleryProps> = ({ onSelectTemplate, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null);

  const categories = [
    { id: 'all', name: 'All Templates', icon: Book },
    { id: 'folklore', name: 'Folklore', icon: Book },
    { id: 'meditation', name: 'Meditation', icon: Star },
    { id: 'educational', name: 'Educational', icon: FileText },
    { id: 'children', name: 'Children', icon: Book },
    { id: 'adventure', name: 'Adventure', icon: Book },
    { id: 'podcast', name: 'Podcast', icon: FileText },
    { id: 'travel', name: 'Travel', icon: FileText }
  ];

  const getFilteredTemplates = (): StoryTemplate[] => {
    let templates = STORY_TEMPLATES;

    if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory);
    }

    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
    }

    return templates;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-700';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700';
      case 'advanced':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleUseTemplate = (template: StoryTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const filteredTemplates = getFilteredTemplates();

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-3xl text-gray-800">Story Templates</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close template gallery"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            Choose from professionally crafted Caribbean story templates to get started quickly
          </p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Categories */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="font-medium text-gray-700 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Template Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-heading text-xl text-gray-600 mb-2">No templates found</h3>
                <p className="text-gray-500">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedTemplate(template)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-heading text-lg text-gray-800 flex-1">
                          {template.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                          {template.difficulty}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {template.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>~{template.estimatedDuration}s</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{template.content.split(' ').length} words</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-white text-gray-600 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseTemplate(template);
                        }}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        size="sm"
                      >
                        Use This Template
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Template Preview Modal */}
        <AnimatePresence>
          {selectedTemplate && (
            <motion.div
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTemplate(null)}
            >
              <motion.div
                className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-heading text-2xl text-gray-800">{selectedTemplate.title}</h3>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close preview"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {selectedTemplate.content}
                  </p>
                </div>

                {selectedTemplate.voiceSuggestion && (
                  <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm font-medium text-emerald-800 mb-1">Voice Suggestion:</p>
                    <p className="text-sm text-emerald-700">{selectedTemplate.voiceSuggestion}</p>
                  </div>
                )}

                <Button
                  onClick={() => handleUseTemplate(selectedTemplate)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  Use This Template
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default StoryTemplateGallery;

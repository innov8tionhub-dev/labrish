import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle, Search, Filter, BookOpen, MessageCircle, Shield, CreditCard, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchInput from '@/components/common/SearchInput';
import { handleKeyboardNavigation } from '@/lib/accessibility';
import { useAnalytics } from '@/lib/analytics';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  popularity: number;
  lastUpdated: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

const InteractiveFAQ: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'recent' | 'alphabetical'>('popularity');
  const { track } = useAnalytics();

  const categories: FAQCategory[] = [
    { id: 'all', name: 'All Questions', icon: <HelpCircle className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700', count: 0 },
    { id: 'getting-started', name: 'Getting Started', icon: <BookOpen className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700', count: 5 },
    { id: 'voice-features', name: 'Voice Features', icon: <MessageCircle className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700', count: 8 },
    { id: 'billing', name: 'Billing & Plans', icon: <CreditCard className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700', count: 6 },
    { id: 'technical', name: 'Technical Support', icon: <Settings className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700', count: 7 },
    { id: 'security', name: 'Security & Privacy', icon: <Shield className="w-4 h-4" />, color: 'bg-red-100 text-red-700', count: 4 },
    { id: 'advanced', name: 'Advanced Features', icon: <Zap className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700', count: 3 }
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: "How do I get started with Labrish?",
      answer: "Getting started with Labrish is simple! First, create your free account by clicking 'Sign Up' and providing your email and password. Once registered, you'll be taken to your dashboard where you can explore our features. Start by visiting the Text-to-Speech Studio to create your first Caribbean-voiced story. You can type or upload text, select from our library of authentic Caribbean voices, and generate high-quality audio in seconds.",
      category: 'getting-started',
      tags: ['signup', 'onboarding', 'first-steps'],
      popularity: 95,
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      question: "What Caribbean accents are available?",
      answer: "Labrish offers an extensive collection of authentic Caribbean voices including Jamaican Patois, Trinidadian Creole, Barbadian Bajan, Guyanese, Saint Lucian, and more. Our Pro plan includes access to 15+ premium voices, each carefully trained on native speaker patterns. We regularly add new accents based on user requests and community feedback. Each voice can be customized with stability, similarity, and style settings to match your specific needs.",
      category: 'voice-features',
      tags: ['accents', 'voices', 'caribbean', 'customization'],
      popularity: 88,
      lastUpdated: '2024-01-20'
    },
    {
      id: '3',
      question: "Can I train my own voice with Labrish?",
      answer: "Yes! Labrish Pro subscribers can create personalized voice clones using our advanced voice training feature. Simply upload 30 seconds to 5 minutes of clear audio recordings of your voice reading provided text samples. Our AI will analyze your speech patterns, accent, and vocal characteristics to create a unique voice model. The training process typically takes 10-15 minutes, and you'll receive a quality score upon completion. Your custom voice can then be used for all your storytelling projects.",
      category: 'voice-features',
      tags: ['voice-cloning', 'training', 'personalization', 'pro-features'],
      popularity: 82,
      lastUpdated: '2024-01-18'
    },
    {
      id: '4',
      question: "What are the differences between subscription plans?",
      answer: "Labrish offers three plans: Starter (Free) includes 5 AI-voiced stories per month with basic Caribbean accents and community sharing. Labrish Pro ($19.99/month) provides unlimited stories, full accent library access, custom voice training, HD audio quality, commercial usage rights, and priority support. Enterprise (Custom pricing) includes everything in Pro plus API access, custom accent development, white-label solutions, and dedicated account management. Annual subscriptions save 17% on Pro plans.",
      category: 'billing',
      tags: ['pricing', 'plans', 'features', 'comparison'],
      popularity: 76,
      lastUpdated: '2024-01-22'
    },
    {
      id: '5',
      question: "Is my data secure with Labrish?",
      answer: "Absolutely. Labrish employs enterprise-grade security measures to protect your data. All voice recordings and stories are encrypted both in transit and at rest using AES-256 encryption. We never share your personal voice models or private content with third parties. Our infrastructure is hosted on secure cloud platforms with regular security audits. You maintain full control over your content visibility - choose what to keep private and what to share publicly. We're also GDPR compliant and follow strict data protection protocols.",
      category: 'security',
      tags: ['security', 'privacy', 'encryption', 'gdpr'],
      popularity: 71,
      lastUpdated: '2024-01-19'
    },
    {
      id: '6',
      question: "How long does it take to generate audio?",
      answer: "Audio generation speed depends on text length and server load. Most stories under 500 words generate in 10-30 seconds. Longer texts (up to 2,500 characters) may take 1-2 minutes. Voice training for custom models typically completes within 10-15 minutes after upload. Pro subscribers get priority processing for faster generation times. We also offer batch processing for multiple stories and real-time streaming for immediate audio feedback during typing.",
      category: 'technical',
      tags: ['speed', 'processing', 'generation-time', 'performance'],
      popularity: 68,
      lastUpdated: '2024-01-21'
    },
    {
      id: '7',
      question: "Can I use Labrish for commercial projects?",
      answer: "Yes! Labrish Pro and Enterprise plans include full commercial usage rights. You can use generated audio for podcasts, educational content, marketing materials, audiobooks, and other commercial applications. Free plan users are limited to personal use only. All commercial licenses include attribution requirements and usage guidelines. Enterprise customers can discuss custom licensing terms for large-scale commercial deployments.",
      category: 'billing',
      tags: ['commercial', 'licensing', 'business-use', 'rights'],
      popularity: 65,
      lastUpdated: '2024-01-17'
    },
    {
      id: '8',
      question: "What file formats do you support for upload?",
      answer: "Labrish supports multiple file formats for text input: .txt, .pdf, .doc, and .docx files up to 10MB. For voice training, we accept .mp3, .wav, and .m4a audio files with clear speech quality. Generated audio is provided in high-quality MP3 format, with WAV available for Pro subscribers. All uploads are processed securely and automatically deleted after processing unless you choose to save them to your library.",
      category: 'technical',
      tags: ['file-formats', 'upload', 'audio-formats', 'limits'],
      popularity: 62,
      lastUpdated: '2024-01-16'
    }
  ];

  // Update category counts
  const updatedCategories = categories.map(category => ({
    ...category,
    count: category.id === 'all' ? faqs.length : faqs.filter(faq => faq.category === category.id).length
  }));

  const filteredFaqs = faqs
    .filter(faq => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'alphabetical':
          return a.question.localeCompare(b.question);
        default:
          return 0;
      }
    });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
      track('faq_collapsed', { faq_id: id, question: faqs.find(f => f.id === id)?.question });
    } else {
      newExpanded.add(id);
      track('faq_expanded', { faq_id: id, question: faqs.find(f => f.id === id)?.question });
    }
    setExpandedItems(newExpanded);
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, id: string) => {
    handleKeyboardNavigation(e, {
      onEnter: () => toggleExpanded(id),
      onSpace: () => toggleExpanded(id),
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    track('faq_searched', { query, results_count: filteredFaqs.length });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    track('faq_category_selected', { category: categoryId });
  };

  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-caribbean-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-5xl mb-6 text-gray-800">
            Frequently Asked <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="font-body text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about Labrish and Caribbean voice AI
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200/50 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  placeholder="Search FAQs..."
                  className="w-full"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="recent">Recently Updated</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {updatedCategories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : `${category.color} hover:scale-105 border border-gray-200`
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.icon}
                {category.name}
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {category.count}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No FAQs found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${searchQuery}-${sortBy}`}
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-200/50 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    layout
                  >
                    <button
                      onClick={() => toggleExpanded(faq.id)}
                      onKeyDown={(e) => handleItemKeyDown(e, faq.id)}
                      className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset group"
                      aria-expanded={expandedItems.has(faq.id)}
                      aria-controls={`faq-answer-${faq.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 pr-4">
                          <h3 className="font-heading text-lg text-gray-800 group-hover:text-emerald-600 transition-colors">
                            {faq.question}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                              {updatedCategories.find(c => c.id === faq.category)?.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {faq.popularity}% helpful
                            </span>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedItems.has(faq.id) ? 180 : 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="flex-shrink-0"
                        >
                          <ChevronDown className="w-6 h-6 text-emerald-600 group-hover:text-emerald-700" />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedItems.has(faq.id) && (
                        <motion.div
                          id={`faq-answer-${faq.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6">
                            <div className="h-px bg-gradient-to-r from-emerald-200 to-teal-200 mb-4" />
                            <motion.div
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              <p className="font-body text-gray-600 leading-relaxed mb-4">
                                {faq.answer}
                              </p>
                              
                              {/* Tags */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {faq.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>

                              {/* Helpful Actions */}
                              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                  <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                                    👍 Helpful
                                  </button>
                                  <button className="text-sm text-gray-500 hover:text-gray-700">
                                    👎 Not helpful
                                  </button>
                                </div>
                                <span className="text-xs text-gray-400">
                                  Updated {new Date(faq.lastUpdated).toLocaleDateString()}
                                </span>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Contact Support */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-emerald-200/50">
            <h3 className="font-heading text-2xl mb-4 text-gray-800">Still have questions?</h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you get the most out of Labrish
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => track('contact_support_clicked', { source: 'faq' })}
              >
                Contact Support
              </motion.button>
              <motion.button
                className="px-6 py-3 bg-white text-gray-700 border border-gray-300 hover:border-emerald-300 hover:bg-emerald-50 rounded-full font-semibold transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => track('join_community_clicked', { source: 'faq' })}
              >
                Join Community
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InteractiveFAQ;
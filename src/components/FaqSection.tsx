import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { handleKeyboardNavigation } from '@/lib/accessibility';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const FaqSection: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: "How does the voice training work?",
      answer: "Our AI technology analyzes your voice patterns from a short recording sample. You'll need to read a few paragraphs of text, and our system will create a digital voice model that captures your unique accent and speaking style. The process typically takes 5-10 minutes and requires a minimum of 30 seconds of clear audio.",
      category: 'voice-training'
    },
    {
      id: '2',
      question: "Can I use Labrish for commercial projects?",
      answer: "Yes! Our Storyteller and Enterprise plans include commercial usage rights. You can use Labrish-generated narrations for podcasts, educational content, marketing materials, and other commercial applications. Free plan users have personal use only.",
      category: 'licensing'
    },
    {
      id: '3',
      question: "What accents are available in the library?",
      answer: "We offer a growing collection of Caribbean accents, including Jamaican Patois, Trinidadian Creole, Barbadian Bajan, Guyanese, and more. We regularly add new accents based on user requests and community feedback. Pro users get access to our full library of 8+ authentic voices.",
      category: 'voices'
    },
    {
      id: '4',
      question: "Is my content secure and private?",
      answer: "Absolutely. We use enterprise-grade encryption to protect your stories and voice data. You have full control over what you share publicly and what remains private. We never share your personal voice models or private content with third parties.",
      category: 'security'
    },
    {
      id: '5',
      question: "How accurate are the Caribbean accents?",
      answer: "Our AI voices are trained on authentic Caribbean speech patterns and reviewed by native speakers. We continuously improve our models based on community feedback and linguistic expertise to deliver the most authentic experience possible.",
      category: 'voices'
    },
    {
      id: '6',
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from your dashboard. Your access will continue until the end of your current billing period. We also offer a 30-day money-back guarantee for new subscribers.",
      category: 'billing'
    },
    {
      id: '7',
      question: "What file formats do you support for upload?",
      answer: "We support .txt, .pdf, .doc, and .docx files up to 10MB. For voice training, we accept .mp3, .wav, and .m4a audio files. All uploads are processed securely and deleted after processing unless you choose to save them.",
      category: 'technical'
    },
    {
      id: '8',
      question: "How long does it take to generate audio?",
      answer: "Most audio generation takes 10-30 seconds depending on text length. Longer texts (over 1000 words) may take up to 2 minutes. Voice training typically completes within 5-10 minutes after upload.",
      category: 'technical'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'voice-training', name: 'Voice Training', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'voices', name: 'Voice Library', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'licensing', name: 'Licensing', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'security', name: 'Security', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'billing', name: 'Billing', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'technical', name: 'Technical', icon: <HelpCircle className="w-4 h-4" /> }
  ];

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, id: string) => {
    handleKeyboardNavigation(e, {
      onEnter: () => toggleExpanded(id),
      onSpace: () => toggleExpanded(id),
    });
  };

  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-caribbean-50 to-white scroll-mt-20">
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
            Everything you need to know about Labrish and Caribbean voice AI
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-emerald-50 border border-gray-200'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.icon}
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
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
                    className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset"
                    aria-expanded={expandedItems.has(faq.id)}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-lg text-gray-800 pr-4">
                        {faq.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: expandedItems.has(faq.id) ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex-shrink-0"
                      >
                        {expandedItems.has(faq.id) ? (
                          <ChevronUp className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        )}
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
                          <motion.p 
                            className="font-body text-gray-600 leading-relaxed"
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            {faq.answer}
                          </motion.p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
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
              >
                Contact Support
              </motion.button>
              <motion.button
                className="px-6 py-3 bg-white text-gray-700 border border-gray-300 hover:border-emerald-300 hover:bg-emerald-50 rounded-full font-semibold transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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

export default FaqSection;
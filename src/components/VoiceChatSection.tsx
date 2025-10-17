import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MessageSquare, Volume2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConvAIWidget from './ConvAIWidget';

const VoiceChatSection: React.FC = () => {
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Real-Time Voice Chat",
      description: "Experience natural conversations with authentic Caribbean AI voices"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Interactive Storytelling",
      description: "Engage in dynamic storytelling sessions with AI-powered narration"
    },
    {
      icon: <Volume2 className="w-6 h-6" />,
      title: "Authentic Accents",
      description: "Choose from a variety of Caribbean accents and speaking styles"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Cultural Preservation",
      description: "Help preserve Caribbean oral traditions through AI technology"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-caribbean-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            className="font-heading text-4xl mb-4 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Experience Caribbean Voices
          </motion.h2>
          <motion.p 
            className="font-body text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Chat with AI voices that capture the authentic spirit and rhythm of Caribbean culture
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Features */}
          <motion.div
            className="grid md:grid-cols-2 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <div className="w-12 h-12 bg-caribbean-100 rounded-full flex items-center justify-center text-caribbean-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-heading text-xl mb-2 text-gray-800">{feature.title}</h3>
                  <p className="font-body text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default VoiceChatSection;
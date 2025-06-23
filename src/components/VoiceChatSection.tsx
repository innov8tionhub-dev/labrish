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

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Features */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow"
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

          {/* Voice Chat Widget */}
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-caribbean-200/50"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="text-center mb-6">
              <h3 className="font-heading text-2xl mb-2 text-gray-800">Try It Now</h3>
              <p className="font-body text-gray-600">Start a conversation with our Caribbean AI voice</p>
            </div>

            {!isVoiceChatActive ? (
              <div className="text-center">
                <Button
                  onClick={() => setIsVoiceChatActive(true)}
                  className="bg-gradient-to-r from-caribbean-500 to-teal-500 hover:from-caribbean-600 hover:to-teal-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Voice Chat
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Click to begin your Caribbean voice experience
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <ConvAIWidget 
                  agentId="agent_01jyd8m2mfedx8z5d030pp2nx0"
                  className="min-h-[300px] w-full"
                />
                <div className="text-center">
                  <Button
                    onClick={() => setIsVoiceChatActive(false)}
                    variant="outline"
                    className="border-caribbean-300 text-caribbean-700 hover:bg-caribbean-50"
                  >
                    End Chat
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="bg-gradient-to-r from-caribbean-500/10 to-teal-500/10 backdrop-blur-sm border border-caribbean-400/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="font-heading text-2xl mb-4 text-gray-800">Ready for More?</h3>
            <p className="font-body text-gray-600 mb-6">
              Upgrade to Labrish Pro for unlimited conversations, custom voice training, and access to our full library of Caribbean accents.
            </p>
            <Button
              className="bg-gradient-to-r from-caribbean-500 to-teal-500 hover:from-caribbean-600 hover:to-teal-600 text-white px-8 py-3 rounded-full font-semibold"
            >
              Upgrade to Pro
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VoiceChatSection;
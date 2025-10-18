import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Globe, Sparkles } from 'lucide-react';

const PartnersSection: React.FC = () => {
  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      value: "500+",
      label: "Early Storytellers"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      value: "2,500+",
      label: "Stories Created"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      value: "25+",
      label: "Countries Reached"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      value: "8+",
      label: "Authentic Voices"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-caribbean-50/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl mb-3 text-gray-800">
            Preserving Caribbean Culture, <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">One Story at a Time</span>
          </h2>
          <p className="text-gray-600 font-body">Join thousands of storytellers worldwide</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 bg-white rounded-2xl shadow-lg border border-caribbean-200/50 hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center text-emerald-600">
                {stat.icon}
              </div>
              <div className="font-heading text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <p className="text-sm text-gray-600 font-body">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection
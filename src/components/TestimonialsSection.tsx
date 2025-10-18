import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Cultural Educator",
      content: "Labrish has revolutionized how I share Caribbean stories with my students. The authentic voices make our cultural heritage come alive.",
      rating: 5
    },
    {
      name: "Marcus Chen",
      role: "Podcast Host",
      content: "The voice quality is incredible. My listeners can't believe these are AI-generated Caribbean accents - they sound so natural!",
      rating: 5
    },
    {
      name: "Lisa Thompson",
      role: "Community Leader",
      content: "Finally, a platform that helps preserve our oral traditions while making them accessible to everyone. This is exactly what we needed.",
      rating: 5
    },
    {
      name: "David Rodriguez",
      role: "Content Creator",
      content: "The voice customization features are amazing. I can create authentic Caribbean content that resonates with my audience every single time.",
      rating: 5
    },
    {
      name: "Amara Williams",
      role: "Audio Producer",
      content: "Labrish has saved me countless hours in production. The audio quality and accent accuracy are simply outstanding.",
      rating: 5
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-caribbean-50/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-5xl mb-4 text-gray-800">
            Loved by <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Storytellers</span> Worldwide
          </h2>
          <p className="font-body text-xl text-gray-600">Join our growing community of storytellers</p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-emerald-200/50"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="font-body text-xl text-gray-700 text-center mb-8 leading-relaxed italic">
                  "{testimonials[currentIndex].content}"
                </blockquote>
                <div className="text-center">
                  <p className="font-heading font-bold text-xl text-gray-800">{testimonials[currentIndex].name}</p>
                  <p className="font-body text-emerald-600 font-medium">{testimonials[currentIndex].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center shadow-md"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center shadow-md"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="text-center p-6 bg-white rounded-xl shadow-md border border-emerald-200/30">
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">98%</div>
            <p className="text-gray-600 font-body">User Satisfaction</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md border border-emerald-200/30">
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">4.9</div>
            <p className="text-gray-600 font-body">Average Rating</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md border border-emerald-200/30">
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">24/7</div>
            <p className="text-gray-600 font-body">Support Available</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection
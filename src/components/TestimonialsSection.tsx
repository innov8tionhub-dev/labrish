import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
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
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl mb-4 text-gray-800">Loved by Storytellers Worldwide</h2>
          <p className="font-body text-lg text-gray-600">Join thousands of satisfied users sharing their stories</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="font-body text-gray-600 mb-4">{testimonial.content}</p>
              <div>
                <p className="font-heading font-semibold text-gray-800">{testimonial.name}</p>
                <p className="font-body text-gray-500 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection
import React from 'react';

const NextStepsSection: React.FC = () => {
  return (
    <section className="py-16 bg-caribbean-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-4xl mb-8 text-gray-800">What's next for Labrish</h2>
          
          <div className="prose prose-lg max-w-none">
            <p className="font-body text-lg text-gray-600 mb-8">
              Labrish is a celebration of Caribbean storytelling, powered by TTS API AI. The project pushed us to innovate at the intersection of culture and technology, overcoming challenges in voice synthesis, real-time communication, and design. We're proud to offer a platform where every voice, Caribbean or global, can share its story and be heard.
            </p>
            
            <p className="font-body text-xl text-gray-700 font-semibold text-center">
              Labrish is more than just an app, it's a celebration of culture, technology, and the universal power of storytelling.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NextStepsSection;
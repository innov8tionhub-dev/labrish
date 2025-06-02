import React from 'react';

const LearningsSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-4xl mb-8 text-gray-800">What we learned</h2>
          
          <div className="prose prose-lg max-w-none">
            <p className="font-body text-lg text-gray-600">
              Building Labrish taught us the power and complexity of voice technology. We explored the nuances of Caribbean dialects and the technical challenges of making AI voices sound authentic and expressive. Integrating the ElevenLabs API opened our eyes to the possibilities of real-time, multilingual audio synthesis, as well as the importance of fine-tuning voice settings for natural storytelling. We also gained valuable insights into user experience design, balancing bold Caribbean aesthetics with modern, global usability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningsSection;
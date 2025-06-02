import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-4xl mb-8 text-gray-800">Our Inspiration</h2>
          <p className="font-body text-lg text-gray-600 mb-12">
            Labrish was born from a deep appreciation for the Caribbean's rich oral traditions and the unique energy of island conversation. Growing up surrounded by animated storytelling, expressive dialects, and vibrant community "labrish", the Jamaican term for lively chit-chat, we saw an opportunity to blend this cultural heritage with modern technology. Our goal was to create a digital gathering place where anyone, anywhere, could experience the warmth, humor, and authenticity of Caribbean voices, while also making storytelling accessible and interactive for a global audience.
          </p>

          <h2 className="font-heading text-4xl mb-8 text-gray-800">What it does</h2>
          <div className="space-y-6">
            <p className="font-body text-lg text-gray-600">
              Labrish is a web app that empowers users to chat, narrate, and listen to stories using lifelike AI-generated voices:
            </p>
            <ul className="space-y-4 font-body text-lg text-gray-600 list-disc pl-6">
              <li>Real-Time AI Voice Chat: Connect and converse with others using expressive AI voices, with support for Caribbean accents and global languages.</li>
              <li>Storytelling Studio: Write your own stories and have them narrated by AI, or train the app to use your own voice for a personal touch.</li>
              <li>Cultural Preservation: Celebrate and share Caribbean oral traditions, making them interactive and accessible for a worldwide audience.</li>
              <li>Personalization: Choose from a library of voices or create your own, ensuring every story feels unique and authentic.</li>
              <li>Seamless Integration: Built on ElevenLabs' powerful API, Labrish delivers high-quality, real-time audio experiences across devices.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
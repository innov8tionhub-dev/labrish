import React from 'react';

const TechStackSection: React.FC = () => {
  return (
    <section className="py-16 bg-caribbean-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-4xl mb-8 text-gray-800">How we built it</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-heading text-2xl mb-4 text-gray-700">Tech Stack</h3>
              <p className="font-body text-lg text-gray-600">
                Labrish is a modern web app built with a mobile-first, responsive design philosophy. We leveraged ElevenLabs' API for text-to-speech and voice cloning, using both REST and WebSocket streaming for real-time chat and narration.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-2xl mb-4 text-gray-700">Voice Integration</h3>
              <p className="font-body text-lg text-gray-600">
                We experimented with different ElevenLabs models (Turbo v2 for speed, Multilingual v2 for language variety), customizing voice characteristics for stability, emotion, and similarity to real Caribbean accents.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-2xl mb-4 text-gray-700">Storytelling Studio</h3>
              <p className="font-body text-lg text-gray-600">
                Users can write stories, train their own AI voice, or select from a library of expressive Caribbean voices. We used SSML (Speech Synthesis Markup Language) to add pauses, emphasis, and natural phrasing to narrated stories.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-2xl mb-4 text-gray-700">Frontend Design</h3>
              <p className="font-body text-lg text-gray-600">
                Inspired by 2025 design trends, we incorporated bold, multi-tonal Caribbean color palettes, expressive typography, and playful animations. The UI features bento box layouts, custom illustrations, and both dark/light modes for accessibility.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-2xl mb-4 text-gray-700">Real-Time Features</h3>
              <p className="font-body text-lg text-gray-600">
                We implemented WebRTC and ElevenLabs' streaming API for low-latency, real-time audio conversations, ensuring users could chat and share stories seamlessly.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-2xl mb-4 text-gray-700">Performance & Scalability</h3>
              <p className="font-body text-lg text-gray-600">
                Caching strategies and chunked audio streaming were used to optimize performance and minimize API calls, especially for high-volume or enterprise scenarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
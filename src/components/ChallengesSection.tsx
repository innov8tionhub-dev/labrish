import React from 'react';

const ChallengesSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-4xl mb-8 text-gray-800">Challenges we ran into</h2>
          
          <div className="grid gap-8">
            <div>
              <h3 className="font-heading text-2xl mb-4 text-gray-700">Voice Authenticity</h3>
              <p className="font-body text-lg text-gray-600">
                Achieving natural-sounding Caribbean accents with AI voices required extensive tuning. We had to experiment with different models, voice settings, and SSML tags to avoid monotony or mispronunciation.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-2xl mb-4 text-gray-700">Latency and Streaming</h3>
              <p className="font-body text-lg text-gray-600">
                Real-time audio streaming introduced latency and connection management challenges. Keeping WebSocket connections open and optimizing chunk sizes helped reduce delays, but required careful backend engineering.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-2xl mb-4 text-gray-700">API Limitations and Errors</h3>
              <p className="font-body text-lg text-gray-600">
                We encountered rate limits, occasional audio glitches, and format mismatches. Robust error handling and retry logic were essential for a smooth user experience.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-2xl mb-4 text-gray-700">Design Balance</h3>
              <p className="font-body text-lg text-gray-600">
                Merging bold Caribbean visuals with a clean, modern interface for global users was a creative challenge. We iterated on layouts and color schemes to achieve both authenticity and universal appeal.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-2xl mb-4 text-gray-700">Scalability</h3>
              <p className="font-body text-lg text-gray-600">
                Supporting high volumes of real-time audio interactions required thoughtful caching, queueing, and monitoring strategies to maintain performance and reliability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChallengesSection;
import React from 'react';

const AccomplishmentsSection: React.FC = () => {
  return (
    <section className="py-16 bg-caribbean-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-4xl mb-8 text-gray-800">Accomplishments that we're proud of</h2>
          
          <div className="grid gap-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md">
              <h3 className="font-heading text-xl mb-3 text-gray-700">Authentic Voice Experience</h3>
              <p className="font-body text-lg text-gray-600">
                Successfully created expressive, natural-sounding Caribbean AI voices that resonate with both regional and global users.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md">
              <h3 className="font-heading text-xl mb-3 text-gray-700">Seamless Real-Time Features</h3>
              <p className="font-body text-lg text-gray-600">
                Integrated ElevenLabs' API for real-time chat and storytelling, delivering fast, interactive audio experiences.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md">
              <h3 className="font-heading text-xl mb-3 text-gray-700">Cultural Impact</h3>
              <p className="font-body text-lg text-gray-600">
                Built a platform that celebrates and preserves Caribbean oral traditions, making them accessible to a new generation of storytellers worldwide.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md">
              <h3 className="font-heading text-xl mb-3 text-gray-700">User-Centered Design</h3>
              <p className="font-body text-lg text-gray-600">
                Achieved a balance between bold, culturally authentic visuals and intuitive, modern usability.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md">
              <h3 className="font-heading text-xl mb-3 text-gray-700">Scalable Architecture</h3>
              <p className="font-body text-lg text-gray-600">
                Engineered Labrish to handle high user volumes and real-time communication, ensuring reliability and performance at scale.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md">
              <h3 className="font-heading text-xl mb-3 text-gray-700">Personalization and Accessibility</h3>
              <p className="font-body text-lg text-gray-600">
                Enabled users to train their own voices and choose from a diverse library, making storytelling more personal and inclusive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccomplishmentsSection;
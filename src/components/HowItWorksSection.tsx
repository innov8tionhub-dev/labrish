import React from 'react';
import { Mic2, Headphones, Share2 } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: <Mic2 className="w-8 h-8" />,
      title: "Record Your Voice",
      description: "Train our AI with your voice or choose from our library of authentic Caribbean accents."
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Start Storytelling",
      description: "Write your story and let our AI bring it to life with natural, expressive narration."
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Share & Connect",
      description: "Share your stories with the world and connect with other storytellers."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl mb-4 text-gray-800">How It Works</h2>
          <p className="font-body text-lg text-gray-600">Get started with Labrish in three simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-caribbean-100 rounded-full flex items-center justify-center text-caribbean-600">
                {step.icon}
              </div>
              <h3 className="font-heading text-2xl mb-3 text-gray-800">{step.title}</h3>
              <p className="font-body text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection
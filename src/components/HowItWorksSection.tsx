import React from 'react';
import { Mic2, Headphones, Share2 } from 'lucide-react';
import SectionHeader from '@/components/common/SectionHeader';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: <Mic2 className="w-8 h-8" />,
    title: 'Record Your Voice',
    description:
      'Train our AI with your voice or choose from our library of authentic Caribbean accents.',
  },
  {
    icon: <Headphones className="w-8 h-8" />,
    title: 'Start Storytelling',
    description:
      'Write your story and let our AI bring it to life with natural, expressive narration.',
  },
  {
    icon: <Share2 className="w-8 h-8" />,
    title: 'Share & Connect',
    description: 'Share your stories with the world and connect with other storytellers.',
  },
];

const stepIconWrap =
  'w-16 h-16 mx-auto mb-6 bg-caribbean-100 rounded-full flex items-center justify-center text-caribbean-600';

const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 bg-white scroll-mt-20">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="How It Works"
          subtitle="Get started with Labrish in three simple steps"
        />

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step) => (
            <div key={step.title} className="text-center">
              <div className={stepIconWrap}>{step.icon}</div>
              <h3 className="font-heading text-xl sm:text-2xl mb-3 text-gray-800">
                {step.title}
              </h3>
              <p className="font-body text-sm sm:text-base text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

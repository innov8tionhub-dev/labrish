import React from 'react';
import { Mic, Globe as Globe2, Heart, Zap, Users, Shield } from 'lucide-react';
import SectionHeader from '@/components/common/SectionHeader';

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: <Mic className="w-6 h-6" />,
    title: 'Authentic Caribbean Voices',
    description:
      'Experience real-time conversations with AI-powered Caribbean accents that sound natural and engaging.',
  },
  {
    icon: <Globe2 className="w-6 h-6" />,
    title: 'Global Storytelling',
    description:
      'Share your stories with a worldwide audience while preserving the authentic flavor of Caribbean expression.',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Cultural Preservation',
    description:
      'Help preserve and celebrate Caribbean oral traditions through modern technology.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Real-Time Interaction',
    description:
      'Enjoy seamless, low-latency voice conversations powered by cutting-edge AI technology.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Community Connection',
    description: 'Join a vibrant community of storytellers, listeners, and culture enthusiasts.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Voice Customization',
    description:
      'Create and train your own voice model or choose from our library of authentic accents.',
  },
];

const benefitCard =
  'bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow';

const benefitIconWrap =
  'w-10 h-10 sm:w-12 sm:h-12 bg-caribbean-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 text-caribbean-600';

const BenefitsSection: React.FC = () => {
  return (
    <section id="benefits" className="py-12 sm:py-16 bg-caribbean-50 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeader
          title="Why Choose Labrish?"
          subtitle="Experience the power of authentic Caribbean storytelling"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.title} className={benefitCard}>
              <div className={benefitIconWrap}>{benefit.icon}</div>
              <h3 className="font-heading text-lg sm:text-xl mb-2 text-gray-800">
                {benefit.title}
              </h3>
              <p className="font-body text-sm sm:text-base text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;

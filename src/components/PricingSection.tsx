import React from 'react';
import { Check } from 'lucide-react';

const PricingSection: React.FC = () => {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      features: [
        "5 AI-voiced stories per month",
        "Basic Caribbean accent library",
        "Community sharing",
        "Standard audio quality"
      ]
    },
    {
      name: "Storyteller",
      price: "$19",
      popular: true,
      features: [
        "Unlimited AI-voiced stories",
        "Full accent library access",
        "Custom voice training",
        "HD audio quality",
        "Priority support"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Everything in Storyteller",
        "API access",
        "Custom accent development",
        "Dedicated support",
        "Usage analytics"
      ]
    }
  ];

  return (
    <section className="py-16 bg-caribbean-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl mb-4 text-gray-800">Simple, Transparent Pricing</h2>
          <p className="font-body text-lg text-gray-600">Choose the plan that fits your storytelling needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`bg-white rounded-xl shadow-lg p-8 ${plan.popular ? 'ring-2 ring-caribbean-500 transform scale-105' : ''}`}>
              {plan.popular && (
                <span className="bg-caribbean-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                  Most Popular
                </span>
              )}
              <h3 className="font-heading text-2xl mb-2 text-gray-800">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-gray-600">/month</span>}
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-600">
                    <Check className="w-5 h-5 text-caribbean-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-semibold ${
                plan.popular
                  ? 'bg-caribbean-500 text-white hover:bg-caribbean-600'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } transition-colors`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection
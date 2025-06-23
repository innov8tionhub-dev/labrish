import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { stripeProducts } from '@/stripe-config';
import { createCheckoutSession } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const PricingSection: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId);

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const product = stripeProducts.find(p => p.priceId === priceId);
      if (!product) {
        throw new Error('Product not found');
      }

      const { url } = await createCheckoutSession({
        price_id: priceId,
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/pricing`,
        mode: product.mode,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      alert(error.message || 'Failed to start checkout process');
    } finally {
      setLoading(null);
    }
  };

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
      name: "Labrish Pro",
      price: "$19.99",
      priceId: stripeProducts[0]?.priceId,
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
    <section id="pricing" className="py-16 bg-caribbean-50">
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
                {plan.price !== "Custom" && plan.price !== "Free" && <span className="text-gray-600">/month</span>}
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-600">
                    <Check className="w-5 h-5 text-caribbean-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => plan.priceId ? handleSubscribe(plan.priceId) : undefined}
                disabled={loading === plan.priceId || !plan.priceId}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-caribbean-500 text-white hover:bg-caribbean-600'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.priceId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  plan.priceId ? 'Get Started' : 'Contact Sales'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
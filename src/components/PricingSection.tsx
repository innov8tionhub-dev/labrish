import React, { useState } from 'react';
import { Check, Loader2, Star, Zap, Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { stripeProducts } from '@/stripe-config';
import { createCheckoutSession } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/lib/analytics';

const PricingSection: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();
  const { track } = useAnalytics();

  const handleSubscribe = async (priceId: string, planName: string) => {
    setLoading(priceId);
    track('pricing_plan_selected', { plan: planName, billing_cycle: billingCycle });

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        track('pricing_login_required', { plan: planName });
        navigate('/login');
        return;
      }

      const product = stripeProducts.find(p => p.priceId === priceId);
      if (!product) {
        throw new Error('Product not found');
      }

      track('checkout_initiated', { plan: planName, price_id: priceId });

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
      track('checkout_error', { plan: planName, error: error.message });
      alert(error.message || 'Failed to start checkout process');
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Starter",
      price: "Free",
      yearlyPrice: "Free",
      description: "Perfect for trying out Caribbean voices",
      popular: false,
      features: [
        "5 AI-voiced stories per month",
        "Basic Caribbean accent library",
        "Standard audio quality (MP3)",
        "Basic voice customization"
      ],
      limitations: [
        "Limited to 500 characters per story",
        "Watermarked audio files",
        "No commercial usage rights"
      ],
      cta: "Get Started Free",
      icon: <Star className="w-6 h-6" />,
      color: "from-gray-500 to-slate-500"
    },
    {
      name: "Labrish Pro",
      price: "$19.99",
      yearlyPrice: "$199.99",
      priceId: stripeProducts[0]?.priceId,
      yearlyPriceId: stripeProducts[1]?.priceId,
      description: "Unlimited storytelling with premium features",
      popular: true,
      features: [
        "Unlimited AI-voiced stories",
        "Full accent library access (8+ voices)",
        "Custom voice training",
        "HD audio quality (WAV/MP3)",
        "Advanced voice settings",
        "Commercial usage rights",
        "Audio download & sharing",
        "Story analytics",
        "Batch text processing"
      ],
      cta: "Start Pro Trial",
      icon: <Zap className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-500",
      badge: "Most Popular",
      savings: billingCycle === 'yearly' ? "Save $40/year" : null
    }
  ];

  const getCurrentPrice = (plan: typeof plans[0]) => {
    if (plan.price === "Custom" || plan.price === "Free") return plan.price;
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
  };


  return (
    <section id="pricing" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-caribbean-50 to-white scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-10 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 text-gray-800 px-2">
            Choose Your <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Storytelling</span> Plan
          </h2>
          <p className="font-body text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            From free exploration to enterprise solutions, find the perfect plan for your Caribbean voice storytelling needs
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-lg border border-emerald-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-1 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </motion.div>
        
        {/* Pricing Table Header */}
        <div className="text-center mb-4 sm:mb-6 text-gray-600 text-xs sm:text-sm px-4">
          <p>Free users are limited to 5 generations per month. Pro subscribers get 40 per month.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
                plan.popular
                  ? 'border-emerald-500 md:transform md:scale-105'
                  : 'border-gray-200 hover:border-emerald-300'
              } ${plan.popular ? 'md:col-span-1 lg:col-span-1' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-5 sm:p-6 md:p-8">
                {/* Plan Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center text-white mx-auto mb-3 sm:mb-4`}>
                    {plan.icon}
                  </div>
                  <h3 className="font-heading text-xl sm:text-2xl mb-2 text-gray-800">{plan.name}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 px-2">{plan.description}</p>

                  <div className="mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">{getCurrentPrice(plan)}</span>
                    {plan.price !== "Custom" && plan.price !== "Free" && (
                      <span className="text-gray-600 text-sm ml-1 sm:ml-2">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    )}
                  </div>

                  {plan.savings && billingCycle === 'yearly' && (
                    <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {plan.savings}
                    </div>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limitations (for free plan) */}
                {plan.limitations && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Limitations:</h4>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, i) => (
                        <li key={i} className="text-xs text-gray-600">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => {
                    if (plan.priceId) {
                      const selectedPriceId = billingCycle === 'yearly' && plan.yearlyPriceId
                        ? plan.yearlyPriceId
                        : plan.priceId;
                      handleSubscribe(selectedPriceId, plan.name);
                    } else {
                      navigate('/signup');
                    }
                  }}
                  disabled={loading !== null && (loading === plan.priceId || loading === plan.yearlyPriceId)}
                  className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.priceId ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.cta
                  )}
                </button>

                {plan.name === "Starter" && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    No credit card required
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Information */}
        <motion.div
          className="mt-10 sm:mt-12 md:mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 md:p-8 max-w-4xl mx-auto border border-emerald-200/50">
            <h3 className="font-heading text-xl sm:text-2xl mb-4 sm:mb-6 text-gray-800">Frequently Asked Questions</h3>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 text-sm sm:text-base">Can I change plans anytime?</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 text-sm sm:text-base">What payment methods do you accept?</h4>
                <p className="text-gray-600 text-xs sm:text-sm">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 text-sm sm:text-base">Is there a free trial for Pro?</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Yes! New users get a 7-day free trial of Labrish Pro with full access to all features.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 text-sm sm:text-base">Do you offer refunds?</h4>
                <p className="text-gray-600 text-xs sm:text-sm">We offer a 30-day money-back guarantee for all paid plans, no questions asked.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
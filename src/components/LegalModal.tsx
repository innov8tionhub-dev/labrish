import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  const content = type === 'privacy' ? {
    title: 'Privacy Policy',
    icon: <Shield className="w-6 h-6" />,
    lastUpdated: 'October 18, 2025',
    sections: [
      {
        heading: '1. Information We Collect',
        content: 'We collect information you provide directly to us, including your name, email address, and account credentials. When you use our voice synthesis services, we may collect audio recordings and text inputs to provide our services.'
      },
      {
        heading: '2. How We Use Your Information',
        content: 'We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.'
      },
      {
        heading: '3. Voice Data Processing',
        content: 'Voice recordings you provide for custom voice training are processed securely and used solely to create your personalized voice model. We do not share your voice data with third parties without your explicit consent.'
      },
      {
        heading: '4. Data Security',
        content: 'We use industry-standard encryption and security measures to protect your personal information and voice data. All data is stored securely using enterprise-grade cloud infrastructure.'
      },
      {
        heading: '5. Your Rights',
        content: 'You have the right to access, update, or delete your personal information at any time. You can also request deletion of your voice models and associated data through your account settings.'
      },
      {
        heading: '6. Cookies and Tracking',
        content: 'We use cookies and similar tracking technologies to provide functionality and analyze usage patterns. You can control cookie preferences through your browser settings.'
      },
      {
        heading: '7. Third-Party Services',
        content: 'We use trusted third-party services for payment processing (Stripe) and analytics. These services have their own privacy policies and we ensure they meet our security standards.'
      },
      {
        heading: '8. Children\'s Privacy',
        content: 'Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.'
      },
      {
        heading: '9. International Data Transfers',
        content: 'Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.'
      },
      {
        heading: '10. Changes to This Policy',
        content: 'We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.'
      },
      {
        heading: '11. Contact Us',
        content: 'If you have questions about this privacy policy, please contact us at privacy@labrish.com.'
      }
    ]
  } : {
    title: 'Terms of Service',
    icon: <FileText className="w-6 h-6" />,
    lastUpdated: 'October 18, 2025',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        content: 'By accessing and using Labrish, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'
      },
      {
        heading: '2. Service Description',
        content: 'Labrish provides AI-powered voice synthesis services specializing in Caribbean accents and dialects. We offer text-to-speech conversion, voice cloning, and related audio generation services.'
      },
      {
        heading: '3. User Accounts',
        content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.'
      },
      {
        heading: '4. Acceptable Use',
        content: 'You agree not to use our services for any unlawful purpose, to create misleading or deceptive content, to impersonate others without consent, or to generate content that violates intellectual property rights.'
      },
      {
        heading: '5. Voice Cloning Ethics',
        content: 'When creating custom voice models, you must have explicit permission from the individual whose voice you are cloning. Unauthorized voice cloning is strictly prohibited and may result in account termination.'
      },
      {
        heading: '6. Content Ownership',
        content: 'You retain ownership of the text and scripts you provide. Generated audio files are licensed to you based on your subscription plan. Commercial use rights are only available to Pro subscribers.'
      },
      {
        heading: '7. Subscription and Billing',
        content: 'Paid subscriptions are billed in advance on a monthly or annual basis. You can cancel your subscription at any time, and it will remain active until the end of your current billing period.'
      },
      {
        heading: '8. Usage Limits',
        content: 'Each subscription tier includes specific usage limits. Free users are limited to 5 generations per month, while Pro subscribers receive 40 generations per month. Unused generations do not roll over.'
      },
      {
        heading: '9. Service Availability',
        content: 'We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. We may perform scheduled maintenance and are not liable for temporary service interruptions.'
      },
      {
        heading: '10. Intellectual Property',
        content: 'The Labrish platform, including all AI models, software, and voice libraries, is protected by intellectual property laws. You may not reverse engineer or attempt to extract our AI models.'
      },
      {
        heading: '11. Disclaimers',
        content: 'Our services are provided "as is" without warranties of any kind. We do not guarantee that AI-generated voices will be indistinguishable from human voices or suitable for all purposes.'
      },
      {
        heading: '12. Limitation of Liability',
        content: 'To the maximum extent permitted by law, Labrish shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.'
      },
      {
        heading: '13. Termination',
        content: 'We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, your right to use the service will immediately cease.'
      },
      {
        heading: '14. Governing Law',
        content: 'These terms are governed by the laws of Jamaica. Any disputes shall be resolved in the courts of Jamaica.'
      },
      {
        heading: '15. Changes to Terms',
        content: 'We may modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.'
      },
      {
        heading: '16. Contact Information',
        content: 'For questions about these Terms of Service, please contact us at legal@labrish.com.'
      }
    ]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-4 sm:inset-8 md:inset-16 lg:inset-24 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white">
                  {content.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-gray-800">{content.title}</h2>
                  <p className="text-sm text-gray-600">Last updated: {content.lastUpdated}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="max-w-3xl mx-auto space-y-6">
                {content.sections.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">{section.heading}</h3>
                    <p className="text-gray-600 leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LegalModal;

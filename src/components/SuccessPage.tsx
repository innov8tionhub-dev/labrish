import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading period to show the success animation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-200/50 text-center relative">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="font-heading text-3xl text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">
              Thank you for subscribing to Labrish Pro. Your account has been upgraded to our premium tier.
            </p>
          </div>

          {sessionId && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-700">
                <strong>Session ID:</strong> {sessionId}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">What's Next?</h3>
              <ul className="text-sm text-gray-600 space-y-1 text-left list-none">
                <li>• Unlimited AI-voiced stories</li>
                <li>• Full Caribbean accent library (8+ voices)</li>
                <li>• Custom voice training capabilities</li>
                <li>• HD audio quality (WAV/MP3)</li>
                <li>• Commercial usage rights</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.location.href = 'https://labrish.online/'}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
              <Button
                onClick={() => window.location.href = 'https://labrish.online/dashboard'}
                variant="outline"
                className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-2"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@labrish.online" className="text-emerald-600 hover:text-emerald-700">
                support@labrish.online
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
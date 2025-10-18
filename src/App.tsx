import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ToastContainer, useToast } from '@/components/common/Toast';
import { useSEO, pageConfigs } from '@/lib/seo';
import LoadingSpinner from './components/common/LoadingSpinner';
import Navbar from './components/Navbar';
import StickyCTABar from './components/StickyCTABar';
import CaribbeanVoiceHero from './components/ui/CaribbeanVoiceHero';
import PartnersSection from './components/PartnersSection';
import BenefitsSection from './components/BenefitsSection';
import VoiceChatSection from './components/VoiceChatSection';
import InteractiveStory from './components/InteractiveStory';
import HowItWorksSection from './components/HowItWorksSection';
import PricingSection from './components/PricingSection';
import TestimonialsSection from './components/TestimonialsSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';

const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const SignupPage = lazy(() => import('./components/auth/SignupPage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const SuccessPage = lazy(() => import('./components/SuccessPage'));
const ForgotPasswordPage = lazy(() => import('./components/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./components/auth/ResetPasswordPage'));
const TextToSpeechPage = lazy(() => import('./pages/TextToSpeechPage'));
const AdvancedAnalyticsDashboard = lazy(() => import('./components/analytics/AdvancedAnalyticsDashboard'));
const EnhancedSecurityDashboard = lazy(() => import('./components/auth/EnhancedAuthentication'));
const VoiceCloningStudio = lazy(() => import('./components/voice/VoiceCloningStudio'));
const VoiceDesignStudio = lazy(() => import('./components/voice/VoiceDesignStudio'));

const HomePage: React.FC = () => {
  const { updateSEO } = useSEO();
  
  React.useEffect(() => {
    updateSEO(pageConfigs.home);
  }, [updateSEO]);

  return (
    <main className="min-h-screen">
      <Navbar />
      <StickyCTABar />
      <CaribbeanVoiceHero />
      <PartnersSection />
      <BenefitsSection />
      <VoiceChatSection />
      <InteractiveStory />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <Footer />
    </main>
  );
};

const DashboardPage: React.FC = () => {
  const { updateSEO } = useSEO();
  
  React.useEffect(() => {
    updateSEO(pageConfigs.dashboard);
  }, [updateSEO]);

  return <Dashboard />;
};

const TextToSpeechPageWrapper: React.FC = () => {
  const { updateSEO } = useSEO();
  
  React.useEffect(() => {
    updateSEO(pageConfigs.textToSpeech);
  }, [updateSEO]);

  return <TextToSpeechPage />;
};

const PricingPageWrapper: React.FC = () => {
  const { updateSEO } = useSEO();
  
  React.useEffect(() => {
    updateSEO(pageConfigs.pricing);
  }, [updateSEO]);

  return <HomePage />;
};

const AnalyticsPage: React.FC = () => {
  const { updateSEO } = useSEO();
  
  React.useEffect(() => {
    updateSEO({
      title: 'Analytics Dashboard - Labrish',
      description: 'Comprehensive analytics and insights for your Caribbean voice content. Track performance, engagement, and audience metrics.',
      keywords: ['analytics', 'insights', 'performance metrics', 'content analytics', 'voice analytics'],
    });
  }, [updateSEO]);

  return <AdvancedAnalyticsDashboard />;
};

const SecurityPage: React.FC = () => {
  const { updateSEO } = useSEO();
  
  React.useEffect(() => {
    updateSEO({
      title: 'Security Settings - Labrish',
      description: 'Manage your account security with advanced features including two-factor authentication, session management, and security monitoring.',
      keywords: ['security', 'two-factor authentication', 'account security', 'privacy settings'],
    });
  }, [updateSEO]);

  return <EnhancedSecurityDashboard />;
};

const VoiceStudioPage: React.FC = () => {
  const { updateSEO } = useSEO();
  
  React.useEffect(() => {
    updateSEO({
      title: 'Voice Cloning Studio - Labrish',
      description: 'Create personalized AI voice clones with our advanced voice training technology. Train your own Caribbean voice for authentic storytelling.',
      keywords: ['voice cloning', 'voice training', 'AI voice', 'personalized voice', 'voice synthesis'],
    });
  }, [updateSEO]);

  return <VoiceCloningStudio />;
};

const VoiceDesignPage: React.FC = () => {
  const { updateSEO } = useSEO();
  
  React.useEffect(() => {
    updateSEO({
      title: 'Voice Design Studio - Labrish',
      description: 'Create custom voices with our AI-powered voice design technology. Describe the voice you want, and we\'ll generate it.',
      keywords: ['voice design', 'custom voice', 'AI voice', 'voice generator', 'personalized voice'],
    });
  }, [updateSEO]);

  return <VoiceDesignStudio />;
};

const AppContent: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <>
      <Router>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/pricing" element={<PricingPageWrapper />} />
            <Route path="/text-to-speech" element={<TextToSpeechPageWrapper />} />
          </Routes>
        </Suspense>
      </Router>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
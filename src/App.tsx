import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ToastContainer, useToast } from '@/components/common/Toast';
import { useSEO, pageConfigs } from '@/lib/seo';
import Navbar from './components/Navbar';
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
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import Dashboard from './components/Dashboard';
import SuccessPage from './components/SuccessPage';
import TextToSpeechPage from './pages/TextToSpeechPage';
import AdvancedAnalyticsDashboard from './components/analytics/AdvancedAnalyticsDashboard';
import EnhancedSecurityDashboard from './components/auth/EnhancedAuthentication';
import VoiceCloningStudio from './components/voice/VoiceCloningStudio';

const HomePage: React.FC = () => {
  const { updateSEO } = useSEO();
  
  React.useEffect(() => {
    updateSEO(pageConfigs.home);
  }, [updateSEO]);

  return (
    <main className="min-h-screen">
      <Navbar />
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

const AppContent: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/voice-studio" element={<VoiceStudioPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/pricing" element={<PricingPageWrapper />} />
          <Route path="/text-to-speech" element={<TextToSpeechPageWrapper />} />
        </Routes>
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
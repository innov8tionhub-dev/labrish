import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ToastContainer, useToast } from '@/components/common/Toast';
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

const HomePage: React.FC = () => (
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

const AppContent: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/pricing" element={<HomePage />} />
          <Route path="/text-to-speech" element={<TextToSpeechPage />} />
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
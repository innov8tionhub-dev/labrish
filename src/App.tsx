import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ToastContainer, useToast } from '@/components/common/Toast';
import { pageConfigs } from '@/lib/seo';
import SEOPage from '@/components/common/SEOPage';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
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
import FeedbackWidget from './components/feedback/FeedbackWidget';

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
const FeatureRequestBoard = lazy(() => import('./components/feedback/FeatureRequestBoard'));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));

const HomePage: React.FC = () => (
  <SEOPage config={pageConfigs.home}>
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
  </SEOPage>
);

const AppContent: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <AuthProvider>
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
            <Route path="/pricing" element={<SEOPage config={pageConfigs.pricing}><HomePage /></SEOPage>} />
            <Route path="/feedback" element={<ProtectedRoute><SEOPage config={pageConfigs.feedback}><FeatureRequestBoard /></SEOPage></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><SEOPage config={pageConfigs.dashboard}><Dashboard /></SEOPage></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><SEOPage config={pageConfigs.analytics}><AdvancedAnalyticsDashboard /></SEOPage></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><SEOPage config={pageConfigs.security}><EnhancedSecurityDashboard /></SEOPage></ProtectedRoute>} />
            <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
            <Route path="/text-to-speech" element={<ProtectedRoute><SEOPage config={pageConfigs.textToSpeech}><TextToSpeechPage /></SEOPage></ProtectedRoute>} />
            <Route path="/voice-cloning" element={<ProtectedRoute><SEOPage config={pageConfigs.voiceCloning}><VoiceCloningStudio /></SEOPage></ProtectedRoute>} />
            <Route path="/voice-design" element={<ProtectedRoute><SEOPage config={pageConfigs.voiceDesign}><VoiceDesignStudio /></SEOPage></ProtectedRoute>} />
            <Route path="/discover" element={<ProtectedRoute><SEOPage config={pageConfigs.discover}><DiscoverPage /></SEOPage></ProtectedRoute>} />
            <Route path="/learn/:storyId" element={<ProtectedRoute><SEOPage config={pageConfigs.learn}><LearnPage /></SEOPage></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><SEOPage config={pageConfigs.quiz}><QuizPage /></SEOPage></ProtectedRoute>} />
          </Routes>
          <FeedbackWidget />
        </Suspense>
      </Router>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </AuthProvider>
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

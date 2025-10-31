import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ToastContainer, useToast } from '@/components/common/Toast';
import { useSEO, pageConfigs } from '@/lib/seo';
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

const FeedbackPage: React.FC = () => {
  const { updateSEO } = useSEO();

  React.useEffect(() => {
    updateSEO({
      title: 'Feature Requests - Labrish',
      description: 'Vote on features you\'d like to see in Labrish. Your feedback shapes the future of our Caribbean Voice AI Platform.',
      keywords: ['feature requests', 'feedback', 'roadmap', 'community'],
    });
  }, [updateSEO]);

  return <FeatureRequestBoard />;
};

const DiscoverPageWrapper: React.FC = () => {
  const { updateSEO } = useSEO();

  React.useEffect(() => {
    updateSEO({
      title: 'Discover Stories - Labrish',
      description: 'Explore trending Caribbean stories from our community. Swipe through authentic voices and cultural narratives.',
      keywords: ['discover', 'stories', 'Caribbean content', 'community', 'trending'],
    });
  }, [updateSEO]);

  return <DiscoverPage />;
};

const LearnPageWrapper: React.FC = () => {
  const { updateSEO } = useSEO();

  React.useEffect(() => {
    updateSEO({
      title: 'Learn - Labrish',
      description: 'Learn Caribbean culture and language through interactive stories with synchronized transcripts and vocabulary building.',
      keywords: ['learn', 'language learning', 'Caribbean culture', 'vocabulary', 'education'],
    });
  }, [updateSEO]);

  return <LearnPage />;
};

const QuizPageWrapper: React.FC = () => {
  const { updateSEO } = useSEO();

  React.useEffect(() => {
    updateSEO({
      title: 'Cultural Quizzes - Labrish',
      description: 'Test your Caribbean cultural knowledge, earn XP, and unlock achievements. Challenge yourself with daily quizzes!',
      keywords: ['quiz', 'cultural knowledge', 'Caribbean culture', 'learning', 'achievements'],
    });
  }, [updateSEO]);

  return <QuizPage />;
};

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
            <Route path="/pricing" element={<PricingPageWrapper />} />
            <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
            <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
            <Route path="/text-to-speech" element={<ProtectedRoute><TextToSpeechPageWrapper /></ProtectedRoute>} />
            <Route path="/discover" element={<ProtectedRoute><DiscoverPageWrapper /></ProtectedRoute>} />
            <Route path="/learn/:storyId" element={<ProtectedRoute><LearnPageWrapper /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><QuizPageWrapper /></ProtectedRoute>} />
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
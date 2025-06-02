import React from 'react';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import TechStackSection from './components/TechStackSection';
import ChallengesSection from './components/ChallengesSection';
import AccomplishmentsSection from './components/AccomplishmentsSection';
import LearningsSection from './components/LearningsSection';
import NextStepsSection from './components/NextStepsSection';

function App() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <TechStackSection />
      <ChallengesSection />
      <AccomplishmentsSection />
      <LearningsSection />
      <NextStepsSection />
    </main>
  );
}

export default App;
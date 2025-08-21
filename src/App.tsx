import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTranslation } from 'react-i18next';
import './i18n';
import { MandelbrotBackground } from './components/MandelbrotBackground';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { SkillsSection } from './components/SkillsSection';
import { PortfolioSection } from './components/PortfolioSection';
import { TimelineSection } from './components/TimelineSection';
import { GoalsSection } from './components/GoalsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

function App() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Taal wijzigen
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  };

  // Initialiseer taal bij component mount
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  return (
    <div className="App relative">
      {/* Mandelbrot Achtergrond - Volledig scherm */}
      <div className="fixed inset-0 -z-10">
        <Canvas
          camera={{ position: [0, 0, 1], fov: 75 }}
          style={{ background: 'transparent' }}
        >
          <MandelbrotBackground />
        </Canvas>
      </div>

      {/* Navigation */}
      <Navigation 
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
      />

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <PortfolioSection />
        <SkillsSection />
        <TimelineSection />
        <GoalsSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;

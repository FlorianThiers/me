import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTranslation } from 'react-i18next';
import './i18n';

// Components
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { PortfolioSection } from './components/PortfolioSection';
import { SkillsSection } from './components/SkillsSection';
import { TimelineSection } from './components/TimelineSection';
import { GoalsSection } from './components/GoalsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { MandelbrotBackground } from './components/MandelbrotBackground';
import { MandelbrotControls } from './components/MandelbrotControls';

function App() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [mandelbrotParams, setMandelbrotParams] = useState({
    iterations: 200,
    zoom: 0.05,
    rotation: 0.05,
    colorSpeed: 0.3,
    glowIntensity: 0.15,
    color1: '#00ff88',
    color2: '#ff0088',
    color3: '#0088ff',
    color4: '#8800ff'
  });

  // Taal wijzigen
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  };

  // Initialiseer taal bij component mount
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  // Update Mandelbrot parameters
  const handleMandelbrotParamsUpdate = (newParams: typeof mandelbrotParams) => {
    console.log('App: Updating Mandelbrot params:', newParams); // Debug log
    console.log('App: Previous params were:', mandelbrotParams); // Debug log
    
    // Zorg ervoor dat alle parameters correct zijn
    const validatedParams = {
      iterations: Math.max(50, Math.min(500, newParams.iterations)),
      zoom: Math.max(0.01, Math.min(0.2, newParams.zoom)),
      rotation: Math.max(0, Math.min(0.2, newParams.rotation)),
      colorSpeed: Math.max(0.1, Math.min(1.0, newParams.colorSpeed)),
      glowIntensity: Math.max(0.05, Math.min(0.3, newParams.glowIntensity)),
      color1: newParams.color1,
      color2: newParams.color2,
      color3: newParams.color3,
      color4: newParams.color4
    };
    
    setMandelbrotParams(validatedParams);
    
    // Force re-render van de MandelbrotBackground
    setTimeout(() => {
      console.log('App: Params updated, current state:', validatedParams);
    }, 0);
  };

  // Toggle control panel
  const toggleControls = () => {
    setIsControlsOpen(!isControlsOpen);
  };

  return (
    <div className="App relative">
      {/* Mandelbrot Achtergrond - Volledig scherm */}
      <div className="fixed inset-0 -z-10">
        <Canvas
          camera={{ position: [0, 0, 1], fov: 75 }}
          style={{ background: 'transparent' }}
        >
          <MandelbrotBackground params={mandelbrotParams} />
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

      {/* Mandelbrot Control Panel */}
      <MandelbrotControls
        onUpdateParams={handleMandelbrotParamsUpdate}
        isOpen={isControlsOpen}
        onToggle={toggleControls}
        currentParams={mandelbrotParams}
      />
    </div>
  );
}

export default App;

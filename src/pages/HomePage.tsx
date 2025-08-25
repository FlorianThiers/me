import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { AboutSection } from '../components/AboutSection';
import { ContactSection } from '../components/ContactSection';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <ContactSection />
    </div>
  );
};

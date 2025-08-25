import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { MandelbrotBackground } from './MandelbrotBackground';
import { ChevronDown, Github, Linkedin, Mail } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();

  const scrollToNext = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero Section - Welcome to Florian's Portfolio"
    >
      {/* Mandelbrot Achtergrond */}
      <div 
        className="absolute inset-0 z-0"
        aria-hidden="true"
        role="presentation"
      >
        <Canvas
          camera={{ position: [0, 0, 1] }}
          style={{ background: 'transparent' }}
        >
          <MandelbrotBackground />
        </Canvas>
      </div>

      {/* Overlay voor betere leesbaarheid - Verminderd zodat achtergrond zichtbaar is */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-dark-bg/20 via-dark-bg/10 to-dark-bg/40 z-10"
        aria-hidden="true"
        role="presentation"
      />

      {/* Content */}
      <div className="relative z-20 container-custom text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Hoofdtitel */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 neon-text"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {t('hero.title')}
          </motion.h1>

          {/* Subtitel */}
          <motion.p
            className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Beschrijving */}
          <motion.p
            className="text-lg md:text-xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {t('hero.description')}
          </motion.p>

          {/* CTA Button */}
          <motion.button
            className="bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-4 px-8 rounded-full text-lg hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300 transform hover:scale-105"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToNext}
            aria-label={`${t('hero.cta')} - Navigate to About section`}
          >
            {t('hero.cta')}
          </motion.button>

          {/* Sociale Media Links */}
          <nav
            className="flex justify-center space-x-6 mt-12"
            aria-label="Social Media Links"
          >
            <motion.a
              href="https://github.com/FlorianThiers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-neon-green transition-colors duration-200"
              whileHover={{ scale: 1.2, y: -5 }}
              aria-label="Visit Florian's GitHub profile"
              title="GitHub Profile"
            >
              <Github size={28} aria-hidden="true" />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/florian-thiers-2908ba305/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-neon-blue transition-colors duration-200"
              whileHover={{ scale: 1.2, y: -5 }}
              aria-label="Visit Florian's LinkedIn profile"
              title="LinkedIn Profile"
            >
              <Linkedin size={28} aria-hidden="true" />
            </motion.a>
            <motion.a
              href="mailto:florthiers@gmail.com"
              className="text-white/70 hover:text-neon-pink transition-colors duration-200"
              whileHover={{ scale: 1.2, y: -5 }}
              aria-label="Send email to Florian"
              title="Email Florian"
            >
              <Mail size={28} aria-hidden="true" />
            </motion.a>
          </nav>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <motion.button
            onClick={scrollToNext}
            className="text-white/60 hover:text-neon-green transition-colors duration-200"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            aria-label="Scroll to next section"
            title="Scroll down"
          >
            <ChevronDown size={32} aria-hidden="true" />
          </motion.button>
        </motion.div>
      </div>

      {/* Decoratieve elementen */}
      <div 
        className="absolute top-20 left-10 w-32 h-32 bg-neon-green/10 rounded-full blur-3xl animate-pulse"
        aria-hidden="true"
        role="presentation"
      />
      <div 
        className="absolute bottom-20 right-10 w-40 h-40 bg-neon-blue/10 rounded-full blur-3xl animate-pulse delay-1000"
        aria-hidden="true"
        role="presentation"
      />
      <div 
        className="absolute top-1/2 left-20 w-24 h-24 bg-neon-pink/10 rounded-full blur-3xl animate-pulse delay-500"
        aria-hidden="true"
        role="presentation"
      />
    </section>
  );
};

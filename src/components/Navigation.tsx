import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe, Menu, X } from 'lucide-react';

interface NavigationProps {
  onLanguageChange: (lang: string) => void;
  currentLanguage: string;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  onLanguageChange, 
  currentLanguage 
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect voor navigatie
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll naar sectie
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  // Taal wijzigen
  const handleLanguageChange = (lang: string) => {
    onLanguageChange(lang);
    setIsOpen(false);
  };

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'about', label: t('nav.about') },
    { id: 'portfolio', label: t('nav.portfolio') },
    { id: 'skills', label: t('nav.skills') },
    { id: 'timeline', label: t('nav.timeline') },
    { id: 'goals', label: t('nav.goals') },
    { id: 'contact', label: t('nav.contact') },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-dark-bg/90 backdrop-blur-md border-b border-white/10' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-custom px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="text-2xl font-bold neon-text cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection('home')}
          >
            Florian Thiers
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                className="text-white/80 hover:text-neon-green transition-colors duration-200 font-medium"
                whileHover={{ scale: 1.05 }}
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* Taal Switcher & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Taal Switcher */}
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.05 }}
            >
              <button className="flex items-center space-x-2 text-white/80 hover:text-neon-green transition-colors duration-200">
                <Globe size={20} />
                <span className="hidden sm:block font-medium">
                  {currentLanguage.toUpperCase()}
                </span>
              </button>
              
              {/* Taal Dropdown */}
              <div className="absolute top-full right-0 mt-2 bg-dark-secondary border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button
                  className={`block w-full px-4 py-2 text-left hover:bg-white/5 transition-colors duration-200 ${
                    currentLanguage === 'en' ? 'text-neon-green' : 'text-white/80'
                  }`}
                  onClick={() => handleLanguageChange('en')}
                >
                  English
                </button>
                <button
                  className={`block w-full px-4 py-2 text-left hover:bg-white/5 transition-colors duration-200 ${
                    currentLanguage === 'nl' ? 'text-neon-green' : 'text-white/80'
                  }`}
                  onClick={() => handleLanguageChange('nl')}
                >
                  Nederlands
                </button>
              </div>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white/80 hover:text-neon-green transition-colors duration-200"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                className="block w-full text-left px-4 py-2 text-white/80 hover:text-neon-green hover:bg-white/5 rounded-lg transition-all duration-200"
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

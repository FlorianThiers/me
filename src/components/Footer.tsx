import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail, Heart, Coffee } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/FlorianThiers',
      color: 'hover:text-white'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://www.linkedin.com/in/florian-thiers-2908ba305/',
      color: 'hover:text-neon-blue'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: 'https://twitter.com',
      color: 'hover:text-neon-green'
    },
    {
      name: 'Email',
      icon: Mail,
      url: 'mailto:florthiers@gmail.com',
      color: 'hover:text-neon-pink'
    }
  ];

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Skills', href: '#skills' },
    { name: 'Timeline', href: '#timeline' },
    { name: 'Goals', href: '#goals' },
    { name: 'Contact', href: '#contact' }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-dark-secondary border-t border-white/10 relative overflow-hidden">
      {/* Decoratieve achtergrond elementen */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10 left-20 w-64 h-64 bg-neon-green rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-neon-blue rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <h3 className="text-2xl font-bold neon-text mb-4">
                Portfolio
              </h3>
              <p className="text-white/70 mb-6 max-w-md">
                Creative developer passionate about building innovative digital experiences. 
                Specializing in modern web technologies and interactive design.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, y: -3 }}
                    className={`w-10 h-10 bg-dark-bg border border-white/20 rounded-lg flex items-center justify-center text-white/70 ${social.color} transition-all duration-300 hover:border-neon-green/50`}
                  >
                    <social.icon size={20} />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <button
                      onClick={() => scrollToSection(link.href.substring(1))}
                      className="text-white/70 hover:text-neon-green transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-2 text-sm">
                <p className="text-white/70">
                  <span className="text-neon-green">Email:</span><br />
                  florthiers@gmail.com
                </p>
                <p className="text-white/70">
                  <span className="text-neon-blue">Location:</span><br />
                  Gent, Belgium
                </p>
                <p className="text-white/70">
                  <span className="text-neon-pink">Status:</span><br />
                  Available for projects
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-white/10 py-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-white/60 text-sm">
              © 2024 Portfolio. {t('footer.rights')}
            </div>

            {/* Made with Love */}
            <div className="flex items-center space-x-2 text-white/60 text-sm">
              <span>{t('footer.madeWith')}</span>
              <Heart className="w-4 h-4 text-neon-pink animate-pulse" />
              <Coffee className="w-4 h-4 text-neon-yellow" />
            </div>

            {/* Back to Top */}
            <motion.button
              onClick={() => scrollToSection('home')}
              className="text-white/60 hover:text-neon-green transition-colors duration-200 text-sm flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Back to Top</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Gradient Border Bottom */}
      <div className="h-1 bg-gradient-to-r from-neon-green via-neon-blue to-neon-pink" />
    </footer>
  );
};

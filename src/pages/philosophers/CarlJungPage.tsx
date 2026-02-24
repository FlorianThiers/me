import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Brain, BookOpen, Users, Lightbulb, Calendar, MapPin, Award } from 'lucide-react';

export const CarlJungPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen pt-20 bg-dark-secondary relative overflow-hidden">
      {/* Decoratieve achtergrond elementen */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-5"
        aria-hidden="true"
        role="presentation"
      >
        <div className="absolute top-32 left-32 w-80 h-80 bg-neon-green rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-neon-purple rounded-full blur-3xl" />
      </div>

      <div className="container-custom px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 neon-text">
              {t('carlJung.title')}
            </h1>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
              {t('carlJung.subtitle')}
            </p>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              to="/mind-computer"
              className="inline-flex items-center space-x-2 text-neon-green hover:text-neon-blue transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('carlJung.backToMindComputer')}</span>
            </Link>
          </motion.div>
        </div>

        {/* Personal Information */}
        <div className="max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-2xl p-8 border border-neon-green/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {t('carlJung.personalInfo')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neon-green" />
                  <div>
                    <h3 className="font-semibold text-white">{t('carlJung.born')}</h3>
                    <p className="text-white/70">26 juli 1875, Kesswil, Zwitserland</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neon-green" />
                  <div>
                    <h3 className="font-semibold text-white">{t('carlJung.died')}</h3>
                    <p className="text-white/70">6 juni 1961, Küsnacht, Zwitserland</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-neon-green" />
                  <div>
                    <h3 className="font-semibold text-white">{t('carlJung.nationality')}</h3>
                    <p className="text-white/70">Zwitsers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-neon-green" />
                  <div>
                    <h3 className="font-semibold text-white">{t('carlJung.occupation')}</h3>
                    <p className="text-white/70">Psychiater, Psychoanalyticus, Schrijver</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-white mb-3">{t('carlJung.mainEducation')}</h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li>• Geneeskunde aan de Universiteit van Bazel</li>
                  <li>• Psychiatrie aan de Universiteit van Zürich</li>
                  <li>• Werkte onder Eugen Bleuler in de Burghölzli kliniek</li>
                  <li>• Samenwerking met Sigmund Freud (1907-1913)</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Core Theories */}
        <div className="max-w-6xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('carlJung.coreTheories')}
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              {t('carlJung.coreTheoriesSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Collective Unconscious */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-neon-purple" />
                {t('carlJung.collectiveUnconscious.title')}
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                {t('carlJung.collectiveUnconscious.description')}
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-green text-sm font-medium">
                   <strong>{t('carlJung.collectiveUnconscious.computerEquivalent')}</strong>
                 </p>
               </div>
            </motion.div>

            {/* Archetypes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-neon-blue" />
                {t('carlJung.archetypes.title')}
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                {t('carlJung.archetypes.description')}
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-blue text-sm font-medium">
                   <strong>{t('carlJung.archetypes.computerEquivalent')}</strong>
                 </p>
               </div>
            </motion.div>

            {/* Individuation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-neon-green" />
                {t('carlJung.individuation.title')}
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                {t('carlJung.individuation.description')}
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-green text-sm font-medium">
                   <strong>{t('carlJung.individuation.computerEquivalent')}</strong>
                 </p>
               </div>
            </motion.div>

            {/* Active Imagination */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Lightbulb className="w-6 h-6 mr-2 text-neon-yellow" />
                {t('carlJung.activeImagination.title')}
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                {t('carlJung.activeImagination.description')}
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-yellow text-sm font-medium">
                   <strong>{t('carlJung.activeImagination.computerEquivalent')}</strong>
                 </p>
               </div>
            </motion.div>
          </div>
        </div>

        {/* Historical Context */}
        <div className="max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="bg-gradient-to-r from-neon-purple/20 to-neon-green/20 rounded-2xl p-8 border border-neon-purple/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {t('carlJung.historicalContext.title')}
            </h2>
            <div className="space-y-6 text-white/80">
              <div>
                <h3 className="text-lg font-bold text-neon-purple mb-3">{t('carlJung.historicalContext.timePeriod')}</h3>
                <p className="text-sm leading-relaxed mb-4">
                  {t('carlJung.historicalContext.timePeriodText1')}
                </p>
                <p className="text-sm leading-relaxed">
                  {t('carlJung.historicalContext.timePeriodText2')}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-neon-green font-semibold mb-2">{t('carlJung.historicalContext.mainBooks')}</h4>
                  <ul className="text-sm space-y-1">
                    {(t('carlJung.historicalContext.books', { returnObjects: true }) as string[]).map((book, idx) => (
                      <li key={idx}>• {book}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-neon-blue font-semibold mb-2">{t('carlJung.historicalContext.modernInfluence')}</h4>
                  <ul className="text-sm space-y-1">
                    {(t('carlJung.historicalContext.influences', { returnObjects: true }) as string[]).map((influence, idx) => (
                      <li key={idx}>• {influence}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Connection to Computer Model */}
        <div className="max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-2xl p-8 border border-neon-green/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {t('carlJung.computerScience.title')}
            </h2>
            <div className="space-y-6 text-white/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-neon-green mb-3">{t('carlJung.computerScience.hierarchicalStructure.title')}</h3>
                  <p className="text-sm leading-relaxed">
                    {t('carlJung.computerScience.hierarchicalStructure.description')}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neon-blue mb-3">{t('carlJung.computerScience.universalPatterns.title')}</h3>
                  <p className="text-sm leading-relaxed">
                    {t('carlJung.computerScience.universalPatterns.description')}
                  </p>
                </div>
              </div>
              
              <div className="bg-dark-bg/30 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-bold text-neon-purple mb-3">{t('carlJung.computerScience.modernInterpretation.title')}</h3>
                <p className="text-sm leading-relaxed">
                  {t('carlJung.computerScience.modernInterpretation.description')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="text-center"
        >
          <p className="text-white/70 mb-6 text-lg">
            {t('carlJung.cta')}
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/#contact"
              className="inline-block bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-8 rounded-full hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300"
            >
              {t('carlJung.ctaButton')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Zap, Brain, AlertTriangle, Lightbulb, BookOpen, Users } from 'lucide-react';

export const SubstancesPage: React.FC = () => {
  const { t } = useTranslation();
  
  const substanceKeys = ['cannabis', 'psychedelics', 'meditation'];
  const substances = substanceKeys.map(key => ({
    key,
    name: t(`substances.substances.${key}.name`),
    category: t(`substances.substances.${key}.category`),
    effect: t(`substances.substances.${key}.effect`),
    computerEquivalent: t(`substances.substances.${key}.computerEquivalent`),
    benefits: t(`substances.substances.${key}.benefits`, { returnObjects: true }) as string[],
    risks: t(`substances.substances.${key}.risks`, { returnObjects: true }) as string[],
    research: t(`substances.substances.${key}.research`),
    status: t(`substances.substances.${key}.status`)
  }));

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
              {t('substances.title')}
            </h1>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
              {t('substances.subtitle')}
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
              <span>{t('substances.backToMindComputer')}</span>
            </Link>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('substances.mainTitle')}
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              {t('substances.mainDescription')}
            </p>
          </motion.div>

          {/* Substances Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {substances.map((substance, index) => (
              <motion.div
                key={substance.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.2 }}
                className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300"
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3 text-neon-green">
                    <Zap className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {substance.name}
                  </h3>
                  <span className="inline-block px-3 py-1 bg-dark-bg/50 rounded-full text-xs text-neon-blue border border-neon-blue/30">
                    {substance.category}
                  </span>
                </div>

                {/* Effect */}
                <div className="mb-4">
                  <h4 className="text-neon-green font-semibold mb-2 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    {t('substances.effectOnMind')}
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {substance.effect}
                  </p>
                </div>

                {/* Computer Equivalent */}
                <div className="mb-4">
                  <h4 className="text-neon-blue font-semibold mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {t('substances.computerEquivalent')}
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {substance.computerEquivalent}
                  </p>
                </div>

                {/* Benefits & Risks */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <h4 className="text-neon-green font-semibold mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {t('substances.benefits')}
                    </h4>
                    <ul className="space-y-1">
                      {substance.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-white/70 text-xs flex items-start space-x-2">
                          <span className="text-neon-green mt-1">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-neon-pink font-semibold mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      {t('substances.risks')}
                    </h4>
                    <ul className="space-y-1">
                      {substance.risks.map((risk, idx) => (
                        <li key={idx} className="text-white/70 text-xs flex items-start space-x-2">
                          <span className="text-neon-pink mt-1">⚠</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Research & Status */}
                <div className="space-y-3">
                  <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                    <h4 className="text-neon-purple font-semibold mb-2 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      {t('substances.research')}
                    </h4>
                    <p className="text-white/70 text-xs leading-relaxed">
                      {substance.research}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">{t('substances.status')}</span>
                    <span className={`px-2 py-1 rounded ${
                      substance.status === t('substances.statusLabels.scientificallySupported')
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : substance.status === t('substances.statusLabels.legalInManyCountries')
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {substance.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <p className="text-white/70 mb-6 text-lg">
            {t('substances.cta')}
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/#contact"
              className="inline-block bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-8 rounded-full hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300"
            >
              {t('substances.ctaButton')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

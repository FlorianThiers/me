import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Brain, Users, Lightbulb, Calendar, MapPin, Award, Zap } from 'lucide-react';

export const WilliamJamesPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen pt-20 bg-dark-secondary relative overflow-hidden">
      {/* Decoratieve achtergrond elementen */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-5"
        aria-hidden="true"
        role="presentation"
      >
        <div className="absolute top-32 left-32 w-80 h-80 bg-neon-blue rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-neon-green rounded-full blur-3xl" />
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
              {t('williamJames.title')}
            </h1>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
              {t('williamJames.subtitle')}
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
              <span>{t('williamJames.backToMindComputer')}</span>
            </Link>
          </motion.div>
        </div>

        {/* Personal Information */}
        <div className="max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-neon-blue/20 to-neon-green/20 rounded-2xl p-8 border border-neon-blue/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {t('williamJames.personalInfo')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neon-blue" />
                  <div>
                    <h3 className="font-semibold text-white">{t('williamJames.born')}</h3>
                    <p className="text-white/70">11 januari 1842, New York City, VS</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neon-blue" />
                  <div>
                    <h3 className="font-semibold text-white">{t('williamJames.died')}</h3>
                    <p className="text-white/70">26 augustus 1910, Chocorua, New Hampshire, VS</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-neon-blue" />
                  <div>
                    <h3 className="font-semibold text-white">{t('williamJames.nationality')}</h3>
                    <p className="text-white/70">Amerikaans</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-neon-blue" />
                  <div>
                    <h3 className="font-semibold text-white">{t('williamJames.occupation')}</h3>
                    <p className="text-white/70">Filosoof, Psycholoog, Arts, Professor</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-white mb-3">{t('williamJames.mainEducation')}</h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li>• Geneeskunde aan Harvard Medical School</li>
                  <li>• Filosofie en psychologie aan Harvard University</li>
                  <li>• Eerste professor in psychologie in de VS</li>
                  <li>• Broer van schrijver Henry James</li>
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
              {t('williamJames.coreTheories')}
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              {t('williamJames.coreTheoriesSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stream of Consciousness */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-neon-green" />
                Stream of Consciousness
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                James beschreef bewustzijn als een continue, ononderbroken stroom van gedachten, 
                gevoelens en ervaringen - niet als een reeks afzonderlijke momenten. Het is als 
                een rivier die constant stroomt en verandert.
              </p>
              <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                <p className="text-neon-green text-sm font-medium">
                  <strong>Computer Equivalent:</strong> Real-time data processing en streaming - 
                  een continue stroom van informatie die constant wordt verwerkt en bijgewerkt.
                </p>
              </div>
            </motion.div>

            {/* Pragmatism */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Lightbulb className="w-6 h-6 mr-2 text-neon-blue" />
                Pragmatisme
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                De waarheid van een idee wordt bepaald door zijn praktische gevolgen en nut. 
                Wat werkt in de praktijk is waar. Dit is een praktische benadering van kennis 
                en waarheid die zich richt op resultaten.
              </p>
              <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                <p className="text-neon-blue text-sm font-medium">
                  <strong>Computer Equivalent:</strong> Functionele programmering - code wordt 
                  beoordeeld op basis van wat het doet, niet alleen op theoretische elegantie.
                </p>
              </div>
            </motion.div>

            {/* Radical Empiricism */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-neon-purple" />
                Radical Empiricism
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Alle ervaringen - inclusief relaties, verbindingen en veranderingen - zijn 
                even reëel als de dingen zelf. Er is geen scheiding tussen bewustzijn en 
                de wereld; alles is één doorlopende ervaring.
              </p>
              <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                <p className="text-neon-purple text-sm font-medium">
                  <strong>Computer Equivalent:</strong> Holistische systemen - alle componenten 
                  en hun verbindingen zijn even belangrijk als de individuele onderdelen.
                </p>
              </div>
            </motion.div>

            {/* The Will to Believe */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-neon-yellow" />
                The Will to Believe
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                In sommige situaties moeten we geloven zonder volledig bewijs, omdat 
                het geloof zelf de uitkomst kan beïnvloeden. Dit is vooral relevant 
                voor morele en religieuze overtuigingen.
              </p>
              <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                <p className="text-neon-yellow text-sm font-medium">
                  <strong>Computer Equivalent:</strong> Heuristische algoritmes - soms moeten 
                  we aannames maken om vooruit te komen, zelfs zonder volledige data.
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
            className="bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 rounded-2xl p-8 border border-neon-purple/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Historische Context & Invloed
            </h2>
            <div className="space-y-6 text-white/80">
              <div>
                <h3 className="text-lg font-bold text-neon-purple mb-3">Tijdsperiode & Invloed</h3>
                <p className="text-sm leading-relaxed mb-4">
                  James leefde tijdens de Amerikaanse Gilded Age en de opkomst van de moderne wetenschap. 
                  Zijn werk ontstond als reactie op het Europese rationalisme en idealisme, en legde 
                  de basis voor de Amerikaanse pragmatische traditie.
                </p>
                <p className="text-sm leading-relaxed">
                  Zijn invloed reikt ver buiten de filosofie - naar psychologie, onderwijs, religie, 
                  en zelfs moderne technologie en AI-ontwikkeling.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-neon-green font-semibold mb-2">Belangrijkste Boeken:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• "The Principles of Psychology" (1890)</li>
                    <li>• "The Will to Believe" (1897)</li>
                    <li>• "Pragmatism" (1907)</li>
                    <li>• "The Varieties of Religious Experience" (1902)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-neon-blue font-semibold mb-2">Moderne Invloed:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Moderne cognitieve psychologie</li>
                    <li>• Pragmatische filosofie</li>
                    <li>• Bewustzijnsonderzoek</li>
                    <li>• AI en machine learning</li>
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
              James' Werk & Moderne Computer Wetenschap
            </h2>
            <div className="space-y-6 text-white/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-neon-green mb-3">Dynamische Processen</h3>
                  <p className="text-sm leading-relaxed">
                    James' "stream of consciousness" beschrijft bewustzijn als een continue, 
                    veranderende stroom. Dit inspireert moderne computer wetenschappers om 
                    dynamische, adaptieve systemen te ontwerpen.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neon-blue mb-3">Pragmatische Benadering</h3>
                  <p className="text-sm leading-relaxed">
                    James' pragmatisme focust op wat werkt in de praktijk. Dit inspireert 
                    moderne software ontwikkeling om zich te richten op functionele, 
                    werkende systemen. Waarvan het belang de uitkomst is, niet de achterliggende werking.
                  </p>
                </div>
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
            {t('williamJames.cta')}
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/#contact"
              className="inline-block bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-8 rounded-full hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300"
            >
              {t('williamJames.ctaButton')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

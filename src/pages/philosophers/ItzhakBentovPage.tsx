import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Brain, Users, Calendar, MapPin, Award, Zap, Atom } from 'lucide-react';

export const ItzhakBentovPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen pt-20 bg-dark-secondary relative overflow-hidden">
      {/* Decoratieve achtergrond elementen */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-5"
        aria-hidden="true"
        role="presentation"
      >
        <div className="absolute top-32 left-32 w-80 h-80 bg-neon-purple rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-neon-blue rounded-full blur-3xl" />
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
              {t('itzhakBentov.title')}
            </h1>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
              {t('itzhakBentov.subtitle')}
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
              <span>{t('itzhakBentov.backToMindComputer')}</span>
            </Link>
          </motion.div>
        </div>

        {/* Personal Information */}
        <div className="max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 rounded-2xl p-8 border border-neon-purple/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {t('itzhakBentov.personalInfo')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neon-purple" />
                  <div>
                    <h3 className="font-semibold text-white">{t('itzhakBentov.born')}</h3>
                    <p className="text-white/70">9 augustus 1923, Haifa, Israël</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neon-purple" />
                  <div>
                    <h3 className="font-semibold text-white">{t('itzhakBentov.died')}</h3>
                    <p className="text-white/70">25 mei 1979, Mount St. Helens, Washington, VS</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-neon-purple" />
                  <div>
                    <h3 className="font-semibold text-white">{t('itzhakBentov.nationality')}</h3>
                    <p className="text-white/70">Israëlisch</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-neon-purple" />
                  <div>
                    <h3 className="font-semibold text-white">{t('itzhakBentov.occupation')}</h3>
                    <p className="text-white/70">Uitvinder, Bewustzijnsonderzoeker, Schrijver</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-white mb-3">{t('itzhakBentov.mainEducation')}</h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li>• Technische opleiding in Israël</li>
                  <li>• Uitvinder van medische apparaten</li>
                  <li>• Bewustzijnsonderzoek en meditatie</li>
                  <li>• Schrijver van "Stalking the Wild Pendulum"</li>
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
              {t('itzhakBentov.coreTheories')}
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              {t('itzhakBentov.coreTheoriesSubtitle')} 
              en het onderbewustzijn als actieve schepper van materiële werkelijkheid
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Holographic Reality */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Atom className="w-6 h-6 mr-2 text-neon-purple" />
                Holografische Realiteit
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Bentov stelde dat bewustzijn werkt als een hologram - elk deel bevat informatie 
                over het geheel. Het onderbewustzijn is niet alleen een opslagplaats, maar een 
                actieve schepper van realiteit via quantum velden.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-purple text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Quantum database 
                   (database die actief nieuwe data kan genereren).
                 </p>
               </div>
            </motion.div>

            {/* Quantum Manifestation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-neon-blue" />
                Quantum Manifestatie
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Via quantum velden kan het onderbewustzijn letterlijk materiële realiteit beïnvloeden. 
                Gedachten en intenties zijn niet alleen mentaal, maar hebben fysieke impact op 
                de wereld om ons heen.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-blue text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Reality API 
                   (interface tussen software en hardware).
                 </p>
               </div>
            </motion.div>

            {/* Subconscious as Creator */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-neon-green" />
                Onderbewustzijn als Schepper
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Het onderbewustzijn is niet passief, maar een actieve schepper die constant 
                nieuwe realiteiten genereert. Het werkt als een quantum computer die mogelijkheden 
                kan materialiseren.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-green text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Manifestation engine 
                   (systeem dat nieuwe data kan creëren).
                 </p>
               </div>
            </motion.div>

            {/* Mind-Body Connection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-neon-yellow" />
                Mind-Body Verbinding
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Bentov onderzocht hoe bewustzijn en materie elkaar beïnvloeden. Het lichaam 
                is niet alleen een machine, maar een uitdrukking van bewustzijn dat constant 
                wordt herschapen door het onderbewuste.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-yellow text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Bi-directionele interface 
                   (tweerichtings verbinding tussen software en hardware).
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
              Historische Context & Invloed
            </h2>
            <div className="space-y-6 text-white/80">
              <div>
                <h3 className="text-lg font-bold text-neon-purple mb-3">Tijdsperiode & Invloed</h3>
                <p className="text-sm leading-relaxed mb-4">
                  Bentov leefde tijdens een periode van enorme verandering in wetenschap en bewustzijn. 
                  Zijn werk ontstond uit de combinatie van technische uitvindingen en spirituele 
                  ervaringen, en ontwikkelde zich tot een revolutionaire benadering van realiteit.
                </p>
                <p className="text-sm leading-relaxed">
                  Zijn invloed reikt ver buiten de wetenschap - naar bewustzijnsonderzoek, 
                  spiritualiteit, en zelfs moderne quantum fysica en AI-ontwikkeling.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-neon-green font-semibold mb-2">Belangrijkste Boeken:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• "Stalking the Wild Pendulum" (1977)</li>
                    <li>• "A Brief Tour of Higher Consciousness" (1977)</li>
                    <li>• Verschillende wetenschappelijke artikelen</li>
                    <li>• Patenten voor medische apparaten</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-neon-blue font-semibold mb-2">Moderne Invloed:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Quantum bewustzijnsonderzoek</li>
                    <li>• Holografische realiteit theorieën</li>
                    <li>• Mind-body geneeskunde</li>
                    <li>• AI en bewustzijnsonderzoek</li>
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
            className="bg-gradient-to-r from-neon-green/20 to-neon-purple/20 rounded-2xl p-8 border border-neon-green/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Bentov's Werk & Moderne Computer Wetenschap
            </h2>
            <div className="space-y-6 text-white/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-neon-green mb-3">Actieve Schepping</h3>
                  <p className="text-sm leading-relaxed">
                    Bentov's theorie dat het onderbewustzijn actief realiteit kan scheppen 
                    inspireert moderne computer wetenschappers om systemen te ontwerpen die 
                    niet alleen data verwerken, maar nieuwe content kunnen genereren.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neon-purple mb-3">Quantum Concepten</h3>
                  <p className="text-sm leading-relaxed">
                    Zijn concept van quantum manifestatie inspireert moderne technologie 
                    zoals virtual reality en AI content generatie - het creëren van 
                    nieuwe, interactieve werelden.
                  </p>
                </div>
              </div>
              
              <div className="bg-dark-bg/30 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-bold text-neon-purple mb-3">Wat Bentov ECHT Zei vs. Moderne Interpretaties</h3>
                <p className="text-sm leading-relaxed">
                  <strong>Bentov sprak NOOIT over computers</strong> - hij stierf in 1979. Zijn werk gaat over 
                  bewustzijn, holografische realiteit en quantum manifestatie. <strong>Moderne computer wetenschappers</strong> 
                  gebruiken zijn inzichten over actieve schepping en quantum processen om 
                  betere content generatie systemen te ontwerpen. Dit is een <strong>moderne interpretatie</strong>, 
                  niet Bentov's eigen werk.
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
            {t('itzhakBentov.cta')}
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/#contact"
              className="inline-block bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-8 rounded-full hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300"
            >
              {t('itzhakBentov.ctaButton')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

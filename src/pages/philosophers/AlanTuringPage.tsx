import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Brain, BookOpen, Users, Calendar, MapPin, Award, Cpu } from 'lucide-react';

export const AlanTuringPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen pt-20 bg-dark-secondary relative overflow-hidden">
      {/* Decoratieve achtergrond elementen */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-5"
        aria-hidden="true"
        role="presentation"
      >
        <div className="absolute top-32 left-32 w-80 h-80 bg-neon-yellow rounded-full blur-3xl" />
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
              {t('alanTuring.title')}
            </h1>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
              {t('alanTuring.subtitle')}
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
              <span>{t('alanTuring.backToMindComputer')}</span>
            </Link>
          </motion.div>
        </div>

        {/* Personal Information */}
        <div className="max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-neon-yellow/20 to-neon-green/20 rounded-2xl p-8 border border-neon-yellow/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {t('alanTuring.personalInfo')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neon-yellow" />
                  <div>
                    <h3 className="font-semibold text-white">{t('alanTuring.born')}</h3>
                    <p className="text-white/70">23 juni 1912, Maida Vale, Londen, VK</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neon-yellow" />
                  <div>
                    <h3 className="font-semibold text-white">{t('alanTuring.died')}</h3>
                    <p className="text-white/70">7 juni 1954, Wilmslow, Cheshire, VK</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-neon-yellow" />
                  <div>
                    <h3 className="font-semibold text-white">{t('alanTuring.nationality')}</h3>
                    <p className="text-white/70">Brits</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-neon-yellow" />
                  <div>
                    <h3 className="font-semibold text-white">{t('alanTuring.occupation')}</h3>
                    <p className="text-white/70">Wiskundige, Computerwetenschapper, Logicast</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-white mb-3">{t('alanTuring.mainEducation')}</h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li>• Wiskunde aan King's College, Cambridge</li>
                  <li>• PhD aan Princeton University</li>
                  <li>• Werkte aan Bletchley Park tijdens WOII</li>
                  <li>• Professor aan Manchester University</li>
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
              {t('alanTuring.coreTheories')}
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              {t('alanTuring.coreTheoriesSubtitle')} 
              om de menselijke geest te simuleren
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Turing Machine */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Cpu className="w-6 h-6 mr-2 text-neon-green" />
                Turing Machine
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Een abstracte machine die kan worden gebruikt om elke berekening uit te voeren 
                die door een computer kan worden gedaan. Het is de theoretische basis voor 
                alle moderne computers en programmeertalen.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-green text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Fundamentele computer architectuur 
                   (universele machine voor alle berekeningen).
                 </p>
               </div>
            </motion.div>

            {/* Turing Test */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-neon-blue" />
                Turing Test
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Een test om te bepalen of een machine intelligent gedrag kan vertonen. 
                Als een mens niet kan onderscheiden of hij met een machine of een andere 
                mens praat, is de machine "intelligent".
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-blue text-sm font-medium">
                   <strong>Computer Equivalent:</strong> AI benchmark 
                   (test voor intelligent gedrag).
                 </p>
               </div>
            </motion.div>

            {/* Computational Theory of Mind */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-neon-purple" />
                Computational Theory of Mind
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Het idee dat de menselijke geest kan worden begrepen als een informatieverwerkend 
                systeem. Gedachten, herinneringen en bewustzijn zijn computationele processen 
                die kunnen worden gesimuleerd door computers.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-purple text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Fundament van "Mind as Computer" 
                   (de geest als informatieverwerkend systeem).
                 </p>
               </div>
            </motion.div>

            {/* Universal Computation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-neon-yellow" />
                Universal Computation
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Het principe dat een computer met voldoende geheugen en tijd elke berekening 
                kan uitvoeren die door een andere computer kan worden gedaan. Dit betekent 
                dat alle computers fundamenteel equivalent zijn.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-yellow text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Universele computation 
                   (elke computer kan elke andere simuleren).
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
            className="bg-gradient-to-r from-neon-purple/20 to-neon-yellow/20 rounded-2xl p-8 border border-neon-purple/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Historische Context & Invloed
            </h2>
            <div className="space-y-6 text-white/80">
              <div>
                <h3 className="text-lg font-bold text-neon-purple mb-3">Tijdsperiode & Invloed</h3>
                <p className="text-sm leading-relaxed mb-4">
                  Turing leefde tijdens een periode van enorme verandering in wiskunde, logica 
                  en technologie. Zijn werk ontstond uit de wiskundige logica van Gödel en 
                  ontwikkelde zich tot de basis van moderne computerwetenschap.
                </p>
                <p className="text-sm leading-relaxed">
                  Zijn invloed reikt ver buiten de wiskunde - naar computerwetenschap, AI, 
                  filosofie, en zelfs ons begrip van bewustzijn en intelligentie.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-neon-green font-semibold mb-2">Belangrijkste Bijdragen:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Turing Machine (1936)</li>
                    <li>• Code-breaking in WOII</li>
                    <li>• Turing Test (1950)</li>
                    <li>• Pattern formation in biologie</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-neon-blue font-semibold mb-2">Moderne Invloed:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Alle moderne computers</li>
                    <li>• Kunstmatige intelligentie</li>
                    <li>• Programmeertalen</li>
                    <li>• Bewustzijnsonderzoek</li>
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
            className="bg-gradient-to-r from-neon-green/20 to-neon-yellow/20 rounded-2xl p-8 border border-neon-green/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Turing's Werk & Ons Computer Model
            </h2>
            <div className="space-y-6 text-white/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-neon-green mb-3">Theoretische Basis</h3>
                  <p className="text-sm leading-relaxed">
                    Turing's werk geeft ons de theoretische basis om te zeggen dat de menselijke 
                    geest inderdaad als een computer kan worden gemodelleerd. Dit is niet alleen 
                    een metafoor, maar een wetenschappelijke mogelijkheid.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neon-yellow mb-3">Universal Computation</h3>
                  <p className="text-sm leading-relaxed">
                    Zijn principe van universele computation betekent dat elke computer (inclusief 
                    de menselijke geest) fundamenteel equivalent is aan elke andere computer.
                  </p>
                </div>
              </div>
              
              <div className="bg-dark-bg/30 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-bold text-neon-purple mb-3">Waarom Turing Anders Is</h3>
                <p className="text-sm leading-relaxed">
                  <strong>Turing sprak WEL over computers</strong> - hij was een computer wetenschapper! 
                  Zijn "Computational Theory of Mind" is de enige theorie in deze lijst die 
                  <strong>direct</strong> over computers en bewustzijn gaat. Dit is geen interpretatie, 
                  maar zijn eigen werk. Daarom is Turing's theorie de <strong>fundamentele basis</strong> 
                  voor ons "Mind as Computer" model.
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
            {t('alanTuring.cta')}
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/#contact"
              className="inline-block bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-8 rounded-full hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300"
            >
              {t('alanTuring.ctaButton')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

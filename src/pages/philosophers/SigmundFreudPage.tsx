import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, BookOpen, Users, Calendar, MapPin, Award, Shield } from 'lucide-react';

export const SigmundFreudPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 bg-dark-secondary relative overflow-hidden">
      {/* Decoratieve achtergrond elementen */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-5"
        aria-hidden="true"
        role="presentation"
      >
        <div className="absolute top-32 left-32 w-80 h-80 bg-neon-pink rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-neon-orange rounded-full blur-3xl" />
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
              Sigmund Freud
            </h1>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
              De Oostenrijkse neuroloog en grondlegger van de psychoanalyse, die de fundamenten legde 
              voor ons begrip van het onderbewuste en de structuur van de menselijke psyche
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
              <span>Terug naar Mind as Computer</span>
            </Link>
          </motion.div>
        </div>

        {/* Personal Information */}
        <div className="max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-neon-pink/20 to-neon-orange/20 rounded-2xl p-8 border border-neon-pink/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Persoonlijke Informatie & Geschiedenis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neon-pink" />
                  <div>
                    <h3 className="font-semibold text-white">Geboren:</h3>
                    <p className="text-white/70">6 mei 1856, Freiberg, Moravië (nu Tsjechië)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neon-pink" />
                  <div>
                    <h3 className="font-semibold text-white">Overleden:</h3>
                    <p className="text-white/70">23 september 1939, Londen, Verenigd Koninkrijk</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-neon-pink" />
                  <div>
                    <h3 className="font-semibold text-white">Nationaliteit:</h3>
                    <p className="text-white/70">Oostenrijks (later Brits)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-neon-pink" />
                  <div>
                    <h3 className="font-semibold text-white">Beroep:</h3>
                    <p className="text-white/70">Neuroloog, Psychoanalyticus, Schrijver</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-white mb-3">Belangrijkste Opleiding:</h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li>• Geneeskunde aan de Universiteit van Wenen</li>
                  <li>• Neurologie en fysiologie</li>
                  <li>• Werkte met Jean-Martin Charcot in Parijs</li>
                  <li>• Samenwerking met Josef Breuer</li>
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
              Kern Theorieën & Concepten
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Freud's revolutionaire inzichten over het onderbewuste, dromen en de structuur van de psyche
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Three-Part Model */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-neon-purple" />
                Drie-Lagen Model (Id, Ego, Superego)
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Freud verdeelde de psyche in drie delen: het Id (primitieve driften), het Ego 
                (realistische bemiddelaar), en het Superego (morele geweten). Deze drie delen 
                werken samen en conflicteren met elkaar.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-purple text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Hiërarchisch besturingssysteem 
                   (verschillende processen met verschillende prioriteiten).
                 </p>
               </div>
            </motion.div>

            {/* Unconscious Mind */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-neon-blue" />
                Het Onderbewuste
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Het onderbewuste bevat herinneringen, wensen en impulsen die niet toegankelijk 
                zijn voor het bewuste bewustzijn. Deze kunnen via dromen, vrije associatie 
                en andere technieken naar boven komen.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-blue text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Background processes 
                   (verborgen processen die het systeem beïnvloeden).
                 </p>
               </div>
            </motion.div>

            {/* Dream Analysis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-neon-green" />
                Droomanalyse
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Dromen zijn de "koninklijke weg naar het onderbewuste". Ze bevatten verborgen 
                betekenissen en kunnen helpen bij het begrijpen van onderbewuste conflicten, 
                wensen en trauma's.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-green text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Log files 
                   (informatie over achterliggende systeem processen).
                 </p>
               </div>
            </motion.div>

            {/* Defense Mechanisms */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-neon-yellow" />
                Verdedigingsmechanismen
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Psychologische strategieën die het ego gebruikt om zich te beschermen tegen 
                angst en bedreigende impulsen. Voorbeelden: verdringing, projectie, rationalisatie, 
                en sublimatie.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-yellow text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Firewall 
                   (bescherming tegen bedreigingen en ongewenste toegang).
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
            className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 rounded-2xl p-8 border border-neon-purple/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Historische Context & Invloed
            </h2>
            <div className="space-y-6 text-white/80">
              <div>
                <h3 className="text-lg font-bold text-neon-purple mb-3">Tijdsperiode & Invloed</h3>
                <p className="text-sm leading-relaxed mb-4">
                  Freud leefde tijdens de late 19e en vroege 20e eeuw, een periode van enorme 
                  verandering in wetenschap en cultuur. Zijn werk ontstond uit de neurowetenschap 
                  en ontwikkelde zich tot een revolutionaire benadering van de menselijke psyche.
                </p>
                <p className="text-sm leading-relaxed">
                  Zijn invloed reikt ver buiten de psychologie - naar literatuur, kunst, film, 
                  en zelfs moderne technologie en AI-ontwikkeling.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-neon-green font-semibold mb-2">Belangrijkste Boeken:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• "The Interpretation of Dreams" (1899)</li>
                    <li>• "The Ego and the Id" (1923)</li>
                    <li>• "Civilization and Its Discontents" (1930)</li>
                    <li>• "Beyond the Pleasure Principle" (1920)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-neon-blue font-semibold mb-2">Moderne Invloed:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Moderne psychotherapie</li>
                    <li>• Droomanalyse en interpretatie</li>
                    <li>• Populaire cultuur en media</li>
                    <li>• AI en bewustzijnsonderzoek</li>
                  </ul>
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
            Geïnteresseerd in het bespreken van Freud's psychoanalytische theorieën of hoe ze 
            toegepast kunnen worden in moderne technologie en bewustzijnsonderzoek?
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/#contact"
              className="inline-block bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-8 rounded-full hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300"
            >
              Laten we Bespreken
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, BookOpen, Users, Lightbulb, Calendar, MapPin, Award } from 'lucide-react';

export const CarlJungPage: React.FC = () => {
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
              Carl Gustav Jung
            </h1>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
              De Zwitserse psychiater die de fundamenten legde voor ons begrip van het onderbewuste, 
              archetypen en de structuur van de menselijke psyche
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
            className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-2xl p-8 border border-neon-green/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Persoonlijke Informatie & Geschiedenis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neon-green" />
                  <div>
                    <h3 className="font-semibold text-white">Geboren:</h3>
                    <p className="text-white/70">26 juli 1875, Kesswil, Zwitserland</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neon-green" />
                  <div>
                    <h3 className="font-semibold text-white">Overleden:</h3>
                    <p className="text-white/70">6 juni 1961, Küsnacht, Zwitserland</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-neon-green" />
                  <div>
                    <h3 className="font-semibold text-white">Nationaliteit:</h3>
                    <p className="text-white/70">Zwitsers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-neon-green" />
                  <div>
                    <h3 className="font-semibold text-white">Beroep:</h3>
                    <p className="text-white/70">Psychiater, Psychoanalyticus, Schrijver</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-white mb-3">Belangrijkste Opleiding:</h3>
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
              Kern Theorieën & Concepten
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Jung's revolutionaire inzichten die de psychologie voor altijd hebben veranderd
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
                Collectief Onderbewuste
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Jung stelde dat er naast het persoonlijke onderbewuste een collectief onderbewuste bestaat 
                dat gedeeld wordt door alle mensen. Dit bevat archetypen - universele patronen en beelden 
                die door evolutie zijn doorgegeven.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-green text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Gedeelde database van universele patronen 
                   (zoals een library van standaard templates).
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
                Archetypen
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Universele symbolen en patronen die in alle culturen en tijden voorkomen. 
                Voorbeelden: de Held, de Schaduw, de Anima/Animus, de Wijze Oude Man/Vrouw.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-blue text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Voorgeïnstalleerde software modules 
                   (standaard functies die alle systemen delen).
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
                Individuatie
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Het proces van zelfrealisatie waarbij een persoon zijn volledige potentieel ontwikkelt 
                door integratie van bewuste en onbewuste elementen. Het doel is een geïntegreerde, 
                authentieke persoonlijkheid.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-green text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Systeem optimalisatie 
                   (het verbeteren van je eigen programma's).
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
                Active Imagination
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                Een techniek waarbij je bewust interactie aangaat met je onderbewuste via 
                visualisatie en droomachtige beelden. Dit helpt bij het integreren van 
                onbewuste inhoud en het oplossen van innerlijke conflicten.
              </p>
                             <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                 <p className="text-neon-yellow text-sm font-medium">
                   <strong>Computer Equivalent:</strong> Debug interface 
                   (directe toegang tot systeem processen).
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
                  Jung leefde tijdens een periode van enorme verandering in de psychologie en wetenschap. 
                  Zijn werk ontstond uit de psychoanalyse van Freud, maar ontwikkelde zich tot een 
                  veel bredere, spirituele benadering van de menselijke psyche.
                </p>
                <p className="text-sm leading-relaxed">
                  Zijn invloed reikt ver buiten de psychologie - naar literatuur, kunst, religie, 
                  en zelfs moderne technologie en AI-ontwikkeling.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-neon-green font-semibold mb-2">Belangrijkste Boeken:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• "Psychologische Types" (1921)</li>
                    <li>• "Archetypen en het Collectief Onderbewuste" (1934)</li>
                    <li>• "Herinneringen, Dromen, Overpeinzingen" (1961)</li>
                    <li>• "Man en zijn Symbolen" (1964)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-neon-blue font-semibold mb-2">Moderne Invloed:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Myers-Briggs Type Indicator (MBTI)</li>
                    <li>• Moderne droomanalyse</li>
                    <li>• Archetypische marketing</li>
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
            className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-2xl p-8 border border-neon-green/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Jung's Werk & Moderne Computer Wetenschap
            </h2>
            <div className="space-y-6 text-white/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-neon-green mb-3">Hiërarchische Structuur</h3>
                  <p className="text-sm leading-relaxed">
                    Jung's model van bewustzijn, persoonlijke onbewuste en collectief onbewuste 
                    toont een hiërarchische organisatie. Dit inspireert moderne computer wetenschappers 
                    om gelaagde systemen te ontwerpen met verschillende niveaus van toegang.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neon-blue mb-3">Universele Patronen</h3>
                  <p className="text-sm leading-relaxed">
                    Jung's archetypen zijn universele patronen die alle mensen delen. Dit concept 
                    inspireert het idee van gedeelde software libraries en templates die 
                    verschillende systemen kunnen gebruiken.
                  </p>
                </div>
              </div>
              
              <div className="bg-dark-bg/30 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-bold text-neon-purple mb-3">Wat Jung ECHT Zei vs. Moderne Interpretaties</h3>
                <p className="text-sm leading-relaxed">
                  <strong>Jung sprak NOOIT over computers</strong> - hij stierf in 1961. Zijn werk gaat over 
                  bewustzijn, archetypen en persoonlijke groei. <strong>Moderne computer wetenschappers</strong> 
                  gebruiken zijn inzichten over hiërarchische structuren en universele patronen om 
                  betere systemen te ontwerpen. Dit is een <strong>moderne interpretatie</strong>, niet Jung's eigen werk.
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
            Geïnteresseerd in het bespreken van Jung's theorieën of hoe ze toegepast kunnen worden 
            in moderne technologie en bewustzijnsonderzoek?
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

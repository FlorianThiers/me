import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, Brain, AlertTriangle, Lightbulb, BookOpen, Users } from 'lucide-react';

export const SubstancesPage: React.FC = () => {
  const substances = [
    {
      name: "Cannabis",
      category: "Natuurlijk",
      effect: "Verbreedt bandbreedte, verhoogt creativiteit en associatieve denken",
      computerEquivalent: "Bandwidth booster (verhoogt data doorvoer)",
      benefits: ["Verhoogde creativiteit", "Betere associaties", "Ontspanning", "Nieuwe perspectieven"],
      risks: ["CPU lag bij overmatig gebruik", "Geheugen problemen", "Verslaving"],
      research: "Onderzoek toont verhoogde connectiviteit tussen hersengebieden",
      status: "Wettelijk in veel landen"
    },
    {
      name: "Psychedelica",
      category: "Experimenteel",
      effect: "Opent directe toegang tot onderbewustzijn en breekt firewalls open",
      computerEquivalent: "Root access tot systeem (administrator rechten)",
      benefits: ["Diepe inzichten", "Trauma healing", "Spirituele ervaringen", "Creativiteit boost"],
      risks: ["Psychose risico", "Bad trips", "Langdurige effecten", "Illegaal"],
      research: "Psychedelische therapie toont beloftevolle resultaten",
      status: "Onderzoek in ontwikkeling"
    },
    {
      name: "Meditatie",
      category: "Natuurlijk",
      effect: "Traint CPU efficiëntie en verhoogt focus en controle",
      computerEquivalent: "CPU optimalisatie (betere prestaties)",
      benefits: ["Verhoogde focus", "Betere emotie controle", "Stress reductie", "Langdurige verbeteringen"],
      risks: ["Geen bekende risico's", "Tijd investering vereist"],
      research: "Neuroplasticiteit veranderingen aangetoond in studies",
      status: "Wetenschappelijk onderbouwd"
    }
  ];

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
              Substances & Bewustzijn
            </h1>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
              Verken hoe verschillende stoffen en technieken je mind-computer beïnvloeden. 
              Van natuurlijke methoden tot experimentele benaderingen - allemaal gericht op 
              het optimaliseren van je bewustzijn.
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

        {/* Main Content */}
        <div className="max-w-6xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Hoe Substances Je Computer-Architectuur Beïnvloeden
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Elke stof of techniek heeft een uniek effect op verschillende componenten van je mind-computer. 
              Begrijp de mechanismen en risico's voordat je experimenteert.
            </p>
          </motion.div>

          {/* Substances Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {substances.map((substance, index) => (
              <motion.div
                key={substance.name}
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
                    Effect op Mind-Computer
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {substance.effect}
                  </p>
                </div>

                {/* Computer Equivalent */}
                <div className="mb-4">
                  <h4 className="text-neon-blue font-semibold mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Computer Equivalent
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
                      Voordelen
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
                      Risico's
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
                      Onderzoek
                    </h4>
                    <p className="text-white/70 text-xs leading-relaxed">
                      {substance.research}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Status:</span>
                    <span className={`px-2 py-1 rounded ${
                      substance.status === 'Wetenschappelijk onderbouwd' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : substance.status === 'Wettelijk in veel landen'
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
            Geïnteresseerd in het bespreken van bewustzijnsverruiming of samenwerken aan 
            onderzoek naar de effecten van verschillende stoffen?
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

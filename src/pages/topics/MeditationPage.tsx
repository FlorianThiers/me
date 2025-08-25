import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, Cpu, Lightbulb, BookOpen } from 'lucide-react';

export const MeditationPage: React.FC = () => {
  const techniques = [
    {
      name: "Mindfulness Meditatie",
      description: "Focus op het huidige moment zonder oordeel",
      computerEquivalent: "CPU optimalisatie (betere taakverdeling)",
      benefits: ["Verhoogde focus", "Stress reductie", "Betere emotie controle", "Neuroplasticiteit"],
      difficulty: "Beginner",
      duration: "10-20 minuten",
      research: "Jon Kabat-Zinn's MBSR programma - wetenschappelijk onderbouwd"
    },
    {
      name: "Transcendente Meditatie",
      description: "Gebruik van mantra's voor diepe ontspanning",
      computerEquivalent: "Deep sleep mode (herstel en reparatie)",
      benefits: ["Diepe ontspanning", "Creativiteit boost", "Betere slaap", "Lange termijn effecten"],
      difficulty: "Gemiddeld",
      duration: "20 minuten",
      research: "Maharishi Mahesh Yogi - traditionele Vedische techniek"
    },
    {
      name: "Loving-Kindness Meditatie",
      description: "Cultiveer compassie voor jezelf en anderen",
      computerEquivalent: "Firewall update (betere sociale verbindingen)",
      benefits: ["Meer empathie", "Betere relaties", "Emotionele stabiliteit", "Sociale vaardigheden"],
      difficulty: "Beginner",
      duration: "15-30 minuten",
      research: "Buddhistische traditie - moderne psychologische toepassingen"
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
              Meditatie & CPU Training
            </h1>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
              Leer hoe meditatie je bewustzijn kan optimaliseren, net zoals je een computer kunt 
              optimaliseren voor betere prestaties. Ontdek verschillende technieken en hun effecten 
              op je mind-computer.
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
              Hoe Meditatie Je CPU Optimaliseert
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Meditatie is als het optimaliseren van je computer - het verbetert prestaties, 
              vermindert crashes en maakt je systeem efficiënter. Elke techniek heeft unieke 
              voordelen voor verschillende aspecten van je bewustzijn.
            </p>
          </motion.div>

          {/* Techniques Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {techniques.map((technique, index) => (
              <motion.div
                key={technique.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.2 }}
                className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300"
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3 text-neon-green">
                    <Brain className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {technique.name}
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    {technique.description}
                  </p>
                </div>

                {/* Computer Equivalent */}
                <div className="mb-4">
                  <h4 className="text-neon-blue font-semibold mb-2 flex items-center">
                    <Cpu className="w-4 h-4 mr-2" />
                    Computer Equivalent
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {technique.computerEquivalent}
                  </p>
                </div>

                {/* Benefits */}
                <div className="mb-4">
                  <h4 className="text-neon-green font-semibold mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Voordelen
                  </h4>
                  <ul className="space-y-1">
                    {technique.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-white/70 text-xs flex items-start space-x-2">
                        <span className="text-neon-green mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Moeilijkheid:</span>
                    <span className="px-2 py-1 bg-dark-bg/50 rounded border border-white/20">
                      {technique.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Duur:</span>
                    <span className="px-2 py-1 bg-dark-bg/50 rounded border border-white/20">
                      {technique.duration}
                    </span>
                  </div>
                </div>

                {/* Research */}
                <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                  <h4 className="text-neon-purple font-semibold mb-2 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Onderzoek
                  </h4>
                  <p className="text-white/70 text-xs leading-relaxed">
                    {technique.research}
                  </p>
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
            Geïnteresseerd in het leren van meditatie technieken of samenwerken aan 
            bewustzijnsoptimalisatie projecten?
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

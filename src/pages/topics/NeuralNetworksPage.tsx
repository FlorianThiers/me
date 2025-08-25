import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NeuralNetworksPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 bg-dark-secondary relative overflow-hidden">
      <div className="container-custom px-4 py-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 neon-text">
              Neurale Netwerken
            </h1>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
              Hoe het brein en AI vergelijkbaar zijn
            </p>
          </motion.div>

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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-6">
            In Ontwikkeling
          </h2>
          <p className="text-white/70 text-lg">
            Deze pagina wordt momenteel ontwikkeld. Kom binnenkort terug voor 
            gedetailleerde content over neurale netwerken!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

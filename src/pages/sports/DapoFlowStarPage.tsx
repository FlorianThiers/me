import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Users, Sparkles, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DapoFlowStarPage: React.FC = () => {
  const sections = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Wat is Dapo Flow Star?',
      description: 'Dapo Flow Star is een unieke bewegingskunst die ontstond uit de combinatie van verschillende martial arts, dans en acrobatiek. Het draait om vloeiende, continue bewegingen die de beoefenaar in een staat van "flow" brengen.',
      photoPlaceholder: '📸 Dapo Flow Star demonstratie',
      color: 'from-purple-400 to-pink-600'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Flow State & Beweging',
      description: 'De kern van Dapo Flow Star ligt in het bereiken van een flow state - een mentale toestand waar beweging en bewustzijn samensmelten. Het is een vorm van bewegende meditatie die zowel fysiek als mentaal uitdagend is.',
      photoPlaceholder: '📸 Flow state training',
      color: 'from-blue-400 to-cyan-600'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community & Training',
      description: 'Dapo Flow Star wordt beoefend in een groeiende community van bewegingskunstenaars. Trainingen vinden plaats in parken, gyms en outdoor locaties waar ruimte is voor creatieve expressie.',
      photoPlaceholder: '📸 Community training sessie',
      color: 'from-green-400 to-emerald-600'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Vaardigheden & Technieken',
      description: 'De sport combineert elementen uit capoeira, breakdance, martial arts en yoga. Belangrijke vaardigheden zijn balans, coördinatie, kracht en vooral het vermogen om vloeiend tussen bewegingen te transitioneren.',
      photoPlaceholder: '📸 Techniek demonstratie',
      color: 'from-orange-400 to-red-600'
    }
  ];

  const benefits = [
    {
      title: 'Fysieke Conditie',
      description: 'Verbeterde kracht, flexibiliteit en uithoudingsvermogen door continue beweging en acrobatische elementen.'
    },
    {
      title: 'Mentale Focus',
      description: 'Het bereiken van flow state traint concentratie en mindfulness, wat helpt bij stress management.'
    },
    {
      title: 'Creativiteit',
      description: 'Dapo Flow Star moedigt persoonlijke expressie aan en het ontwikkelen van unieke bewegingspatronen.'
    },
    {
      title: 'Sociale Verbinding',
      description: 'De community aspect brengt gelijkgestemde mensen samen die passie delen voor beweging en kunst.'
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-dark-bg">
      <div className="container-custom px-4 py-8">
        
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center mb-8">
            <Link
              to="/sports"
              className="mr-4 p-2 rounded-full bg-dark-secondary/50 border border-white/10 hover:border-neon-green/50 transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Dapo Flow Star
              </h1>
              <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
                Een revolutionaire bewegingskunst die martial arts, dans en acrobatiek combineert in een vloeiende, 
                continue flow. Ontdek de kunst van bewegende meditatie en persoonlijke expressie.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-neon-green/50 transition-all duration-300 group"
              >
                {/* Photo Section */}
                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-white/10">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{section.photoPlaceholder}</div>
                    <p className="text-white/60 text-xs">Foto ruimte</p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-2 rounded-full bg-gradient-to-r ${section.color} mr-3 group-hover:scale-110 transition-transform duration-300`}>
                      {section.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {section.title}
                    </h3>
                  </div>
                  
                  <p className="text-white/70 leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Voordelen van Dapo Flow Star
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 hover:border-neon-green/50 transition-all duration-300"
                >
                  <h3 className="text-xl font-bold text-neon-green mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Personal Experience Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Mijn Reis met Dapo Flow Star
            </h2>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed mb-8">
              Dapo Flow Star heeft mijn kijk op beweging en expressie volledig veranderd. Het is meer dan een sport - 
              het is een levensstijl die me leert om vloeiend te zijn, zowel fysiek als mentaal. De combinatie van 
              kracht, gratie en creativiteit maakt elke training tot een unieke ervaring.
            </p>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-8 border border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">
                "Beweging is leven, flow is vrijheid"
              </h3>
              <p className="text-white/80">
                Deze filosofie staat centraal in mijn beoefening van Dapo Flow Star en inspireert me 
                om te blijven groeien en experimenteren met nieuwe bewegingspatronen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

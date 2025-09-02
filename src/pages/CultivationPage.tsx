import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Tent, TreePine, Circle, Cpu, Thermometer, Droplets, Sun, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CultivationPage: React.FC = () => {

  const cultivationProjects = [
    {
      icon: <Home className="w-12 h-12" />,
      title: 'Kamerplanten',
      description: 'Een groeiende collectie kamerplanten die mijn woonruimte omtoveren tot een groene oase. Van luchtzuiverende planten tot exotische soorten.',
      details: ['Monstera Deliciosa', 'Ficus Lyrata', 'Sansevieria', 'Pothos', 'Spider Plant'],
      photoPlaceholder: '🌱',
      color: 'from-green-400 to-emerald-600',
      projects: [
        {
          name: 'Monstera Jungle',
          description: 'Een grote Monstera Deliciosa die uitgroeit tot een echte jungle in de woonkamer.',
          status: 'In groei',
          date: '2024'
        },
        {
          name: 'Luchtzuiverende Collectie',
          description: 'Een selectie van planten die de luchtkwaliteit verbeteren en zuurstof produceren.',
          status: 'Actief',
          date: '2024'
        }
      ]
    },
    {
      icon: <Tent className="w-12 h-12" />,
      title: 'Binnenkweek Tent',
      description: 'Gecontroleerde binnenkweek voor microgreens, tropische planten en experimentele teelt. Een perfecte omgeving voor het hele jaar door groeien.',
      details: ['Microgreens', 'Tropische Planten', 'LED Verlichting', 'Klimaatcontrole', 'Hydroponics'],
      photoPlaceholder: '🏠',
      color: 'from-blue-400 to-cyan-600',
      projects: [
        {
          name: 'Microgreens Station',
          description: 'Een compacte setup voor het kweken van verse microgreens zoals radijs, broccoli en erwten.',
          status: 'In ontwikkeling',
          date: '2024'
        },
        {
          name: 'Tropische Planten Kwekerij',
          description: 'Een warme, vochtige omgeving voor het kweken van tropische planten en exotische soorten.',
          status: 'Gepland',
          date: '2025'
        }
      ]
    },
    {
      icon: <Circle className="w-12 h-12" />,
      title: 'Fungi & Mushrooms',
      description: 'Het fascinerende proces van het kweken van paddenstoelen en schimmels. Van oesterzwammen tot medicinale soorten.',
      details: ['Oesterzwammen', 'Shiitake', 'Medicinale Soorten', 'Mycelium', 'Substraat'],
      photoPlaceholder: '🍄',
      color: 'from-purple-400 to-pink-600',
      projects: [
        {
          name: 'Oesterzwam Kwekerij',
          description: 'Een setup voor het kweken van verse oesterzwammen op koffiedik en houtsubstraat.',
          status: 'Experimenteel',
          date: '2024'
        },
        {
          name: 'Medicinale Fungi',
          description: 'Onderzoek naar het kweken van medicinale paddenstoelen zoals Lion\'s Mane en Reishi.',
          status: 'Onderzoek',
          date: '2025'
        }
      ]
    },
    {
      icon: <TreePine className="w-12 h-12" />,
      title: 'Moestuin',
      description: 'Buitenkweek van groenten, kruiden en fruit. Van zaad tot oogst, het volledige proces van natuurlijke teelt.',
      details: ['Groenten', 'Kruiden', 'Fruit', 'Compost', 'Biologische Teelt'],
      photoPlaceholder: '🥕',
      color: 'from-orange-400 to-red-600',
      projects: [
        {
          name: 'Seizoensgroenten',
          description: 'Een gevarieerde moestuin met seizoensgebonden groenten en kruiden.',
          status: 'Actief',
          date: '2024'
        },
        {
          name: 'Compost Systeem',
          description: 'Een efficiënt compostsysteem voor het recyclen van organisch afval.',
          status: 'In gebruik',
          date: '2024'
        }
      ]
    },
    {
      icon: <Cpu className="w-12 h-12" />,
      title: 'Kweek Automatisatie',
      description: 'Technologische oplossingen voor het automatiseren van kweekprocessen. Van sensoren tot geautomatiseerde irrigatie.',
      details: ['IoT Sensoren', 'Automatische Irrigatie', 'Klimaatcontrole', 'Data Logging', 'Remote Monitoring'],
      photoPlaceholder: '🤖',
      color: 'from-indigo-400 to-purple-600',
      projects: [
        {
          name: 'Smart Irrigation System',
          description: 'Een geautomatiseerd irrigatiesysteem met vochtigheidssensoren en timers.',
          status: 'In ontwikkeling',
          date: '2024'
        },
        {
          name: 'Klimaat Monitoring',
          description: 'Een systeem voor het monitoren van temperatuur, vochtigheid en licht in kweekruimtes.',
          status: 'Prototype',
          date: '2024'
        }
      ]
    },
    {
      icon: <Thermometer className="w-12 h-12" />,
      title: 'Monitoring & Data',
      description: 'Het verzamelen en analyseren van data over groeiomstandigheden om de kweek te optimaliseren.',
      details: ['Data Logging', 'Groeianalyse', 'Optimalisatie', 'Trends', 'Voorspellingen'],
      photoPlaceholder: '📊',
      color: 'from-teal-400 to-cyan-600',
      projects: [
        {
          name: 'Groeidata Dashboard',
          description: 'Een dashboard voor het visualiseren van kweekdata en groeitrends.',
          status: 'Concept',
          date: '2025'
        },
        {
          name: 'Predictive Analytics',
          description: 'Machine learning modellen voor het voorspellen van groei en oogsttijden.',
          status: 'Onderzoek',
          date: '2025'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-dark-bg">
      <div className="container-custom px-4 py-8">
        
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center mb-8">
            <Link
              to="/interests"
              className="mr-4 p-2 rounded-full bg-dark-secondary/50 border border-white/10 hover:border-neon-green/50 transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                🌱 Cultivation & Growing
              </h1>
              <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
                Van kamerplanten tot geautomatiseerde kweeksystemen - ontdek mijn passie voor het kweken 
                en verzorgen van planten. Een combinatie van traditionele teelt en moderne technologie.
              </p>
            </div>
          </div>
        </div>

        {/* Cultivation Projects Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {cultivationProjects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-neon-green/50 transition-all duration-300 group"
              >
                {/* Photo Section */}
                <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-white/10">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{project.photoPlaceholder}</div>
                    <p className="text-white/60 text-sm">Project foto's voor {project.title}</p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${project.color} mr-4 group-hover:scale-110 transition-transform duration-300`}>
                      {project.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {project.title}
                    </h3>
                  </div>
                  
                  <p className="text-white/70 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.details.map((detail) => (
                      <span
                        key={detail}
                        className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm font-medium border border-neon-green/30"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>

                  {/* Projects List */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white mb-3">Actieve Projecten:</h4>
                    {project.projects.map((subProject, subIndex) => (
                      <div key={subIndex} className="bg-dark-bg/50 rounded-lg p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white">{subProject.name}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subProject.status === 'Actief' ? 'bg-green-500/20 text-green-400' :
                            subProject.status === 'In ontwikkeling' ? 'bg-blue-500/20 text-blue-400' :
                            subProject.status === 'Gepland' ? 'bg-yellow-500/20 text-yellow-400' :
                            subProject.status === 'Experimenteel' ? 'bg-purple-500/20 text-purple-400' :
                            subProject.status === 'Onderzoek' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {subProject.status}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm mb-2">{subProject.description}</p>
                        <p className="text-white/40 text-xs">Start: {subProject.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Philosophy Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Waarom Cultivation?
            </h2>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed mb-8">
              Het kweken van planten is meer dan alleen een hobby - het is een manier om verbinding te maken 
              met de natuur, te leren over duurzaamheid, en technologie te gebruiken om groei te optimaliseren. 
              Elke plant heeft zijn eigen behoeften en uitdagingen, wat het een perfecte combinatie maakt van 
              wetenschap, kunst en geduld.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-bold text-neon-green mb-3">Natuur & Duurzaamheid</h3>
                <p className="text-white/70">Het kweken van eigen voedsel en planten draagt bij aan een duurzamere levensstijl en milieubewustzijn.</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <div className="text-4xl mb-4">🔬</div>
                <h3 className="text-xl font-bold text-neon-green mb-3">Wetenschap & Technologie</h3>
                <p className="text-white/70">Het combineren van traditionele kweekmethoden met moderne technologie voor optimale resultaten.</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <div className="text-4xl mb-4">🧘</div>
                <h3 className="text-xl font-bold text-neon-green mb-3">Mindfulness & Geduld</h3>
                <p className="text-white/70">Het verzorgen van planten leert geduld, aandacht en het waarderen van langzame, natuurlijke processen.</p>
              </div>
            </div>
          </div>

          {/* Technology Integration */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Technologie & Innovatie
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Thermometer className="w-8 h-8 text-neon-blue mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Sensoren</h3>
                <p className="text-white/70 text-sm">Temperatuur, vochtigheid en licht monitoring</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Droplets className="w-8 h-8 text-neon-green mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Irrigatie</h3>
                <p className="text-white/70 text-sm">Geautomatiseerde water- en voedingssystemen</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Sun className="w-8 h-8 text-neon-yellow mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">LED Verlichting</h3>
                <p className="text-white/70 text-sm">Energiezuinige groeilampen en spectrums</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Zap className="w-8 h-8 text-neon-purple mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Automatisatie</h3>
                <p className="text-white/70 text-sm">Smart home integratie en remote control</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

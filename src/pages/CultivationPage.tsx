import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Tent, TreePine, Circle, Cpu, Thermometer, Droplets, Sun, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const CultivationPage: React.FC = () => {
  const { t } = useTranslation();

  const cultivationProjects = [
    {
      icon: <Home className="w-12 h-12" />,
      title: t('cultivation.projects.houseplants.title'),
      description: t('cultivation.projects.houseplants.description'),
      details: t('cultivation.projects.houseplants.details', { returnObjects: true }) as string[],
      photoPlaceholder: '🌱',
      color: 'from-green-400 to-emerald-600',
      projects: [
        {
          name: t('cultivation.projects.houseplants.subProjects.monsteraJungle.name'),
          description: t('cultivation.projects.houseplants.subProjects.monsteraJungle.description'),
          status: t('cultivation.projects.houseplants.subProjects.monsteraJungle.status'),
          date: '2024'
        },
        {
          name: t('cultivation.projects.houseplants.subProjects.airPurifying.name'),
          description: t('cultivation.projects.houseplants.subProjects.airPurifying.description'),
          status: t('cultivation.projects.houseplants.subProjects.airPurifying.status'),
          date: '2024'
        }
      ]
    },
    {
      icon: <Tent className="w-12 h-12" />,
      title: t('cultivation.projects.indoorTent.title'),
      description: t('cultivation.projects.indoorTent.description'),
      details: t('cultivation.projects.indoorTent.details', { returnObjects: true }) as string[],
      photoPlaceholder: '🏠',
      color: 'from-blue-400 to-cyan-600',
      projects: [
        {
          name: t('cultivation.projects.indoorTent.subProjects.microgreensStation.name'),
          description: t('cultivation.projects.indoorTent.subProjects.microgreensStation.description'),
          status: t('cultivation.projects.indoorTent.subProjects.microgreensStation.status'),
          date: '2024'
        },
        {
          name: t('cultivation.projects.indoorTent.subProjects.tropicalNursery.name'),
          description: t('cultivation.projects.indoorTent.subProjects.tropicalNursery.description'),
          status: t('cultivation.projects.indoorTent.subProjects.tropicalNursery.status'),
          date: '2025'
        }
      ]
    },
    {
      icon: <Circle className="w-12 h-12" />,
      title: t('cultivation.projects.fungi.title'),
      description: t('cultivation.projects.fungi.description'),
      details: t('cultivation.projects.fungi.details', { returnObjects: true }) as string[],
      photoPlaceholder: '🍄',
      color: 'from-purple-400 to-pink-600',
      projects: [
        {
          name: t('cultivation.projects.fungi.subProjects.oysterFarm.name'),
          description: t('cultivation.projects.fungi.subProjects.oysterFarm.description'),
          status: t('cultivation.projects.fungi.subProjects.oysterFarm.status'),
          date: '2024'
        },
        {
          name: t('cultivation.projects.fungi.subProjects.medicinalFungi.name'),
          description: t('cultivation.projects.fungi.subProjects.medicinalFungi.description'),
          status: t('cultivation.projects.fungi.subProjects.medicinalFungi.status'),
          date: '2025'
        }
      ]
    },
    {
      icon: <TreePine className="w-12 h-12" />,
      title: t('cultivation.projects.vegetableGarden.title'),
      description: t('cultivation.projects.vegetableGarden.description'),
      details: t('cultivation.projects.vegetableGarden.details', { returnObjects: true }) as string[],
      photoPlaceholder: '🥕',
      color: 'from-orange-400 to-red-600',
      projects: [
        {
          name: t('cultivation.projects.vegetableGarden.subProjects.seasonalVegetables.name'),
          description: t('cultivation.projects.vegetableGarden.subProjects.seasonalVegetables.description'),
          status: t('cultivation.projects.vegetableGarden.subProjects.seasonalVegetables.status'),
          date: '2024'
        },
        {
          name: t('cultivation.projects.vegetableGarden.subProjects.compostSystem.name'),
          description: t('cultivation.projects.vegetableGarden.subProjects.compostSystem.description'),
          status: t('cultivation.projects.vegetableGarden.subProjects.compostSystem.status'),
          date: '2024'
        }
      ]
    },
    {
      icon: <Cpu className="w-12 h-12" />,
      title: t('cultivation.projects.automation.title'),
      description: t('cultivation.projects.automation.description'),
      details: t('cultivation.projects.automation.details', { returnObjects: true }) as string[],
      photoPlaceholder: '🤖',
      color: 'from-indigo-400 to-purple-600',
      projects: [
        {
          name: t('cultivation.projects.automation.subProjects.smartIrrigation.name'),
          description: t('cultivation.projects.automation.subProjects.smartIrrigation.description'),
          status: t('cultivation.projects.automation.subProjects.smartIrrigation.status'),
          date: '2024'
        },
        {
          name: t('cultivation.projects.automation.subProjects.climateMonitoring.name'),
          description: t('cultivation.projects.automation.subProjects.climateMonitoring.description'),
          status: t('cultivation.projects.automation.subProjects.climateMonitoring.status'),
          date: '2024'
        }
      ]
    },
    {
      icon: <Thermometer className="w-12 h-12" />,
      title: t('cultivation.projects.monitoring.title'),
      description: t('cultivation.projects.monitoring.description'),
      details: t('cultivation.projects.monitoring.details', { returnObjects: true }) as string[],
      photoPlaceholder: '📊',
      color: 'from-teal-400 to-cyan-600',
      projects: [
        {
          name: t('cultivation.projects.monitoring.subProjects.growthDashboard.name'),
          description: t('cultivation.projects.monitoring.subProjects.growthDashboard.description'),
          status: t('cultivation.projects.monitoring.subProjects.growthDashboard.status'),
          date: '2025'
        },
        {
          name: t('cultivation.projects.monitoring.subProjects.predictiveAnalytics.name'),
          description: t('cultivation.projects.monitoring.subProjects.predictiveAnalytics.description'),
          status: t('cultivation.projects.monitoring.subProjects.predictiveAnalytics.status'),
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
                🌱 {t('cultivation.title')}
              </h1>
              <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
                {t('cultivation.description')}
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
                    <p className="text-white/60 text-sm">{t('cultivation.photoPlaceholder')} {project.title}</p>
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
                    <h4 className="text-lg font-semibold text-white mb-3">{t('cultivation.activeProjects')}</h4>
                    {project.projects.map((subProject, subIndex) => (
                      <div key={subIndex} className="bg-dark-bg/50 rounded-lg p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white">{subProject.name}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subProject.status === t('cultivation.status.active') ? 'bg-green-500/20 text-green-400' :
                            subProject.status === t('cultivation.status.inDevelopment') ? 'bg-blue-500/20 text-blue-400' :
                            subProject.status === t('cultivation.status.planned') ? 'bg-yellow-500/20 text-yellow-400' :
                            subProject.status === t('cultivation.status.experimental') ? 'bg-purple-500/20 text-purple-400' :
                            subProject.status === t('cultivation.status.research') ? 'bg-orange-500/20 text-orange-400' :
                            subProject.status === t('cultivation.status.growing') ? 'bg-green-500/20 text-green-400' :
                            subProject.status === t('cultivation.status.inUse') ? 'bg-blue-500/20 text-blue-400' :
                            subProject.status === t('cultivation.status.prototype') ? 'bg-purple-500/20 text-purple-400' :
                            subProject.status === t('cultivation.status.concept') ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {subProject.status}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm mb-2">{subProject.description}</p>
                        <p className="text-white/40 text-xs">{t('cultivation.startDate')} {subProject.date}</p>
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
              {t('cultivation.philosophy.title')}
            </h2>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed mb-8">
              {t('cultivation.philosophy.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-bold text-neon-green mb-3">{t('cultivation.philosophyCards.nature.title')}</h3>
                <p className="text-white/70">{t('cultivation.philosophyCards.nature.description')}</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <div className="text-4xl mb-4">🔬</div>
                <h3 className="text-xl font-bold text-neon-green mb-3">{t('cultivation.philosophyCards.science.title')}</h3>
                <p className="text-white/70">{t('cultivation.philosophyCards.science.description')}</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <div className="text-4xl mb-4">🧘</div>
                <h3 className="text-xl font-bold text-neon-green mb-3">{t('cultivation.philosophyCards.mindfulness.title')}</h3>
                <p className="text-white/70">{t('cultivation.philosophyCards.mindfulness.description')}</p>
              </div>
            </div>
          </div>

          {/* Technology Integration */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              {t('cultivation.technology.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Thermometer className="w-8 h-8 text-neon-blue mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">{t('cultivation.technology.sensors.title')}</h3>
                <p className="text-white/70 text-sm">{t('cultivation.technology.sensors.description')}</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Droplets className="w-8 h-8 text-neon-green mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">{t('cultivation.technology.irrigation.title')}</h3>
                <p className="text-white/70 text-sm">{t('cultivation.technology.irrigation.description')}</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Sun className="w-8 h-8 text-neon-yellow mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">{t('cultivation.technology.ledLighting.title')}</h3>
                <p className="text-white/70 text-sm">{t('cultivation.technology.ledLighting.description')}</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Zap className="w-8 h-8 text-neon-purple mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">{t('cultivation.technology.automation.title')}</h3>
                <p className="text-white/70 text-sm">{t('cultivation.technology.automation.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

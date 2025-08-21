import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Target, 
  Rocket, 
  Lightbulb, 
  Users, 
  Globe, 
  Code2,
  Award,
  Heart,
  Zap,
  Star,
  Bot,
  Leaf
} from 'lucide-react';

export const GoalsSection: React.FC = () => {
  const { t } = useTranslation();

  const shortTermGoals = [
    {
      icon: Users,
      title: t('goals.parksportsCommunity'),
      description: t('goals.parksportsCommunityDesc'),
      timeline: t('goals.timeline.shortTerm'),
      color: 'neon-yellow'
    },
    {
      icon: Users,
      title: t('goals.immogenSamenwerkers'),
      description: t('goals.immogenSamenwerkersDesc'),
      timeline: t('goals.timeline.shortTerm'),
      color: 'neon-purple'
    },
    {
      icon: Bot,
      title: t('goals.vijverstofzuigers'),
      description: t('goals.vijverstofzuigersDesc'),
      timeline: t('goals.timeline.shortTermExtended'),
      color: 'neon-blue'
    },
    {
      icon: Users,
      title: t('goals.soloprojecten'),
      description: t('goals.soloprojectenDesc'),
      timeline: t('goals.timeline.shortTermExtended'),
      color: 'neon-pink'
    },
    {
      icon: Code2,
      title: t('goals.robotsBouwen'),
      description: t('goals.robotsBouwenDesc'),
      timeline: t('goals.timeline.shortTermExtended2'),
      color: 'neon-green'
    },
  ];

  const longTermGoals = [
    {
      icon: Leaf,
      title: t('goals.properheidAarde'),
      description: t('goals.properheidAardeDesc'),
      timeline: t('goals.timeline.longTerm'),
      color: 'neon-green'
    },
    {
      icon: Globe,
      title: t('goals.ecologischePlaneet'),
      description: t('goals.ecologischePlaneetDesc'),
      timeline: t('goals.timeline.longTermExtended'),
      color: 'neon-blue'
    },
    {
      icon: Lightbulb,
      title: t('goals.aiDrivenBusiness'),
      description: t('goals.aiDrivenBusinessDesc'),
      timeline: t('goals.timeline.longTermExtended'),
      color: 'neon-yellow'
    },
    {
      icon: Award,
      title: t('goals.recognitionNaam'),
      description: t('goals.recognitionNaamDesc'),
      timeline: t('goals.timeline.longTermExtended2'),
      color: 'neon-pink'
    }
  ];

  const personalMission = [
    {
      icon: Heart,
      title: t('goals.duurzaamheid'),
      description: t('goals.duurzaamheidDesc')
    },
    {
      icon: Zap,
      title: t('goals.innovatie'),
      description: t('goals.innovatieDesc')
    },
    {
      icon: Star,
      title: t('goals.kwaliteit'),
      description: t('goals.kwaliteitDesc')
    }
  ];

  return (
    <section id="goals" className="section-padding bg-dark-secondary relative overflow-hidden">
      {/* Decoratieve achtergrond elementen */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 right-32 w-96 h-96 bg-neon-purple rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-32 w-80 h-80 bg-neon-yellow rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 neon-text">
            {t('goals.title')}
          </h2>
          <p className="text-xl text-white/70 mb-8">
            {t('goals.subtitle')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-neon-green to-neon-blue mx-auto rounded-full" />
        </motion.div>

        {/* Short Term Goals */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            {t('goals.shortTerm')}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {shortTermGoals.map((goal, index) => (
              <motion.div
                key={goal.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-dark-bg rounded-xl p-6 border border-white/10 hover:border-neon-green/50 transition-all duration-300 card-hover h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-${goal.color}/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <goal.icon className={`w-8 h-8 text-${goal.color}`} />
                  </div>

                  {/* Title */}
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-neon-green transition-colors duration-300">
                    {goal.title}
                  </h4>

                  {/* Description */}
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    {goal.description}
                  </p>

                  {/* Timeline */}
                  <div className="inline-block px-3 py-1 bg-white/10 text-white/80 text-xs font-medium rounded-full">
                    {goal.timeline}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Long Term Goals */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            {t('goals.longTerm')}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {longTermGoals.map((goal, index) => (
              <motion.div
                key={goal.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-dark-bg rounded-xl p-6 border border-white/10 hover:border-neon-green/50 transition-all duration-300 card-hover h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-${goal.color}/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <goal.icon className={`w-8 h-8 text-${goal.color}`} />
                  </div>

                  {/* Title */}
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-neon-green transition-colors duration-300">
                    {goal.title}
                  </h4>

                  {/* Description */}
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    {goal.description}
                  </p>

                  {/* Timeline */}
                  <div className="inline-block px-3 py-1 bg-white/10 text-white/80 text-xs font-medium rounded-full">
                    {goal.timeline}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Personal Mission */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            {t('goals.mission')}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {personalMission.map((mission, index) => (
              <motion.div
                key={mission.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-neon-green/20 to-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-green/30">
                  <mission.icon className="w-10 h-10 text-neon-green" />
                </div>
                
                <h4 className="text-lg font-semibold text-white mb-3">
                  {mission.title}
                </h4>
                
                <p className="text-white/70 text-sm leading-relaxed">
                  {mission.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Vision Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-2xl p-8 border border-neon-green/30">
            <h3 className="text-2xl font-bold text-white mb-6">
              {t('goals.visionTitle')}
            </h3>
            <p className="text-white/80 text-lg max-w-4xl mx-auto leading-relaxed">
              {t('goals.visionDescription')}
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center justify-center space-x-2 text-neon-green">
                <Target className="w-5 h-5" />
                <span className="font-medium">{t('goals.focused')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neon-blue">
                <Rocket className="w-5 h-5" />
                <span className="font-medium">{t('goals.ambitious')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neon-pink">
                <Heart className="w-5 h-5" />
                <span className="font-medium">{t('goals.passionate')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

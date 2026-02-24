import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, Mountain, Waves, Snowflake, MountainSnow, Zap, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const SportsPage: React.FC = () => {
  const { t } = useTranslation();

  const sportKeys = ['slacklining', 'dailyTraining', 'dapoFlowStar', 'dancing', 'bouldering', 'snowboarding', 'surfing'];
  const sportIcons = [
    <MountainSnow className="w-12 h-12" />,
    <Activity className="w-12 h-12" />,
    <Zap className="w-12 h-12" />,
    <Music className="w-12 h-12" />,
    <Mountain className="w-12 h-12" />,
    <Snowflake className="w-12 h-12" />,
    <Waves className="w-12 h-12" />
  ];
  const sportColors = [
    'from-green-400 to-emerald-600',
    'from-blue-400 to-cyan-600',
    'from-purple-400 to-pink-600',
    'from-rose-400 to-red-600',
    'from-orange-400 to-red-600',
    'from-sky-400 to-blue-600',
    'from-teal-400 to-cyan-600'
  ];
  const sportLinks = [null, null, '/sports/dapo-flow-star', '/sports/dancing', null, null, null];

  const sports = sportKeys.map((key, index) => ({
    key,
    icon: sportIcons[index],
    title: t(`sports.sports.${key}.title`),
    description: t(`sports.sports.${key}.description`),
    details: t(`sports.sports.${key}.details`, { returnObjects: true }) as string[],
    photoPlaceholder: t(`sports.sports.${key}.photoPlaceholder`),
    color: sportColors[index],
    link: sportLinks[index] || undefined
  }));

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
                {t('sports.title')}
              </h1>
              <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
                {t('sports.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Sports Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sports.map((sport, index) => (
              <motion.div
                key={sport.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-neon-green/50 transition-all duration-300 group"
              >
                {sport.link ? (
                  <Link to={sport.link} className="block">
                    {/* Photo Section */}
                    <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-white/10">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{sport.photoPlaceholder}</div>
                        <p className="text-white/60 text-sm">{t('sports.photoSpace')} {sport.title}</p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${sport.color} mr-4 group-hover:scale-110 transition-transform duration-300`}>
                          {sport.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-white">
                          {sport.title}
                        </h3>
                      </div>
                      
                      <p className="text-white/70 mb-4 leading-relaxed">
                        {sport.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {sport.details.map((detail) => (
                          <span
                            key={detail}
                            className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm font-medium border border-neon-green/30"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                      
                      {/* Link Indicator */}
                      <div className="mt-4 text-center">
                        <span className="inline-flex items-center text-neon-green text-sm font-medium group-hover:text-neon-blue transition-colors duration-300">
                          {t('sports.explore')} {sport.title}
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <>
                    {/* Photo Section */}
                    <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-white/10">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{sport.photoPlaceholder}</div>
                        <p className="text-white/60 text-sm">{t('sports.photoSpace')} {sport.title}</p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${sport.color} mr-4 group-hover:scale-110 transition-transform duration-300`}>
                          {sport.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-white">
                          {sport.title}
                        </h3>
                      </div>
                      
                      <p className="text-white/70 mb-4 leading-relaxed">
                        {sport.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {sport.details.map((detail) => (
                          <span
                            key={detail}
                            className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm font-medium border border-neon-green/30"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Philosophy Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('sports.whySports')}
            </h2>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed mb-8">
              {t('sports.whyDescription')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-bold text-neon-green mb-3">{t('sports.balanceFocus.title')}</h3>
                <p className="text-white/70">{t('sports.balanceFocus.description')}</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-bold text-neon-green mb-3">{t('sports.perseverance.title')}</h3>
                <p className="text-white/70">{t('sports.perseverance.description')}</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-bold text-neon-green mb-3">{t('sports.natureAdventure.title')}</h3>
                <p className="text-white/70">{t('sports.natureAdventure.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

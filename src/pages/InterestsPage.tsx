import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Music, Gamepad2, BookOpen, Camera, Palette, Globe, Users, Activity, Brain, Leaf, ChefHat, Calendar, Home, TrendingUp, MessageSquare } from 'lucide-react';
import { ChakraCalendar } from '../components/ChakraCalendar';
import { DevelopmentNoticePopup } from '../components/DevelopmentNoticePopup';

export const InterestsPage: React.FC = () => {
  const { t } = useTranslation();
  const [expandedCard, setExpandedCard] = React.useState<string | null>(null);

  const interests = [
    {
      key: 'meditation',
      icon: <Brain className="w-8 h-8" />,
      title: t('interests.meditation.title'),
      description: t('interests.meditation.description'),
      details: t('interests.meditation.details', { returnObjects: true }) as string[],
      link: '/topics/meditation',
      explore: t('interests.meditation.explore')
    },
    {
      key: 'cultivation',
      icon: <Leaf className="w-8 h-8" />,
      title: t('interests.cultivation.title'),
      description: t('interests.cultivation.description'),
      details: t('interests.cultivation.details', { returnObjects: true }) as string[],
      link: '/cultivation',
      explore: t('interests.cultivation.explore')
    },
    {
      key: 'cooking',
      icon: <ChefHat className="w-8 h-8" />,
      title: t('interests.cooking.title'),
      description: t('interests.cooking.description'),
      details: t('interests.cooking.details', { returnObjects: true }) as string[],
      link: '/cooking',
      explore: t('interests.cooking.explore')
    },
    {
      key: 'philosophy',
      icon: <Users className="w-8 h-8" />,
      title: t('interests.philosophy.title'),
      description: t('interests.philosophy.description'),
      details: t('interests.philosophy.details', { returnObjects: true }) as string[],
      link: '/mind-computer#philosophers',
      explore: t('interests.philosophy.explore')
    },
    {
      key: 'sports',
      icon: <Activity className="w-8 h-8" />,
      title: t('interests.sports.title'),
      description: t('interests.sports.description'),
      details: t('interests.sports.details', { returnObjects: true }) as string[],
      link: '/sports',
      explore: t('interests.sports.explore')
    },
    {
      key: 'music',
      icon: <Music className="w-8 h-8" />,
      title: t('interests.music.title'),
      description: t('interests.music.description'),
      details: t('interests.music.details', { returnObjects: true }) as string[],
      link: '/music',
      explore: t('interests.music.explore')
    },
    {
      key: 'learning',
      icon: <BookOpen className="w-8 h-8" />,
      title: t('interests.learning.title'),
      description: t('interests.learning.description'),
      details: t('interests.learning.details', { returnObjects: true }) as string[]
    },
    {
      key: 'photography',
      icon: <Camera className="w-8 h-8" />,
      title: t('interests.photography.title'),
      description: t('interests.photography.description'),
      details: t('interests.photography.details', { returnObjects: true }) as string[]
    },
    {
      key: 'art',
      icon: <Palette className="w-8 h-8" />,
      title: t('interests.art.title'),
      description: t('interests.art.description'),
      details: t('interests.art.details', { returnObjects: true }) as string[]
    },
    {
      key: 'travel',
      icon: <Globe className="w-8 h-8" />,
      title: t('interests.travel.title'),
      description: t('interests.travel.description'),
      details: t('interests.travel.details', { returnObjects: true }) as string[]
    },
    {
      key: 'gaming',
      icon: <Gamepad2 className="w-8 h-8" />,
      title: t('interests.gaming.title'),
      description: t('interests.gaming.description'),
      details: t('interests.gaming.details', { returnObjects: true }) as string[]
    },
    {
      key: 'timeVisualization',
      icon: <Calendar className="w-8 h-8" />,
      title: t('interests.timeVisualization.title'),
      description: t('interests.timeVisualization.description'),
      details: t('interests.timeVisualization.details', { returnObjects: true }) as string[]
    },
    {
      key: 'gardenDesign',
      icon: <Home className="w-8 h-8" />,
      title: t('interests.gardenDesign.title'),
      description: t('interests.gardenDesign.description'),
      details: t('interests.gardenDesign.details', { returnObjects: true }) as string[],
      link: '/garden-designer',
      explore: t('interests.gardenDesign.explore')
    },
    {
      key: 'investing',
      icon: <TrendingUp className="w-8 h-8" />,
      title: t('interests.investing.title'),
      description: t('interests.investing.description'),
      details: t('interests.investing.details', { returnObjects: true }) as string[],
      link: '/beleggen',
      explore: t('interests.investing.explore')
    },
    {
      key: 'moltbook',
      icon: <MessageSquare className="w-8 h-8" />,
      title: t('interests.moltbook.title'),
      description: t('interests.moltbook.description'),
      details: t('interests.moltbook.details', { returnObjects: true }) as string[],
      link: '/moltbook',
      explore: t('interests.moltbook.explore')
    },

  ];

  return (
    <div className="min-h-screen pt-20">
      <DevelopmentNoticePopup />
      <div className="container-custom px-4 py-8">
        
        <div className="max-w-6xl mx-auto">
          <p className="text-lg text-white/80 text-center mb-12 leading-relaxed">
            {t('interests.intro')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {interests.map((interest, index) => (
              <motion.div
                key={interest.key || interest.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {interest.link ? (
                  <Link
                    to={interest.link}
                    className="block bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 group hover:scale-105"
                  >
                    <div className="flex items-center mb-4">
                      <div className="text-neon-green mr-3 group-hover:scale-110 transition-transform duration-300">
                        {interest.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {interest.title}
                      </h3>
                    </div>

                    <p className="text-white/70 mb-4 leading-relaxed">
                      {interest.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {interest.details.map((detail) => (
                        <span
                          key={detail}
                          className="px-2 py-1 bg-neon-green/20 text-neon-green rounded-full text-xs font-medium border border-neon-green/30"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>

                    <div className="text-center">
                      <span className="inline-flex items-center text-neon-green text-sm font-medium group-hover:text-neon-blue transition-colors duration-300">
                        {interest.explore || t('interests.explore')}
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="block bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 group">
                    {interest.key === 'timeVisualization' ? (
                      // Special expandable card for Chakra Calendar
                      <>
                        <div
                          className="cursor-pointer"
                          onClick={() => setExpandedCard(expandedCard === interest.key ? null : interest.key || interest.title)}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <div className="text-neon-green mr-3 group-hover:scale-110 transition-transform duration-300">
                                {interest.icon}
                              </div>
                              <h3 className="text-xl font-bold text-white">
                                {interest.title}
                              </h3>
                            </div>
                            <div className="text-neon-green">
                              <svg
                                className={`w-5 h-5 transition-transform duration-300 ${expandedCard === interest.key ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>

                          <p className="text-white/70 mb-4 leading-relaxed">
                            {interest.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {interest.details.map((detail) => (
                              <span
                                key={detail}
                                className="px-2 py-1 bg-neon-green/20 text-neon-green rounded-full text-xs font-medium border border-neon-green/30"
                              >
                                {detail}
                              </span>
                            ))}
                          </div>

                          <div className="text-center">
                            <span className="inline-flex items-center text-neon-green text-sm font-medium">
                              {expandedCard === interest.key ? t('interests.timeVisualization.clickToClose') : t('interests.timeVisualization.clickToView')}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Chakra Calendar */}
                        {expandedCard === interest.key && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-6 pt-6 border-t border-white/10"
                          >
                            <ChakraCalendar />
                          </motion.div>
                        )}
                      </>
                    ) : (
                      // Regular non-expandable card
                      <>
                        <div className="flex items-center mb-4">
                          <div className="text-neon-green mr-3 group-hover:scale-110 transition-transform duration-300">
                            {interest.icon}
                          </div>
                          <h3 className="text-xl font-bold text-white">
                            {interest.title}
                          </h3>
                        </div>

                        <p className="text-white/70 mb-4 leading-relaxed">
                          {interest.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {interest.details.map((detail) => (
                            <span
                              key={detail}
                              className="px-2 py-1 bg-neon-green/20 text-neon-green rounded-full text-xs font-medium border border-neon-green/30"
                            >
                              {detail}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

                     <div className="mt-16 text-center">
             <h2 className="text-3xl font-bold text-white mb-6">
               {t('interests.howInterestsShape.title')}
             </h2>
             <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
               {t('interests.howInterestsShape.description')}
             </p>
           </div>

           {/* Mind as Computer Section */}
           <div className="mt-16 text-center">
             <h2 className="text-3xl font-bold text-white mb-6">
               {t('interests.mindAsComputer.title')}
             </h2>
             <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed mb-8">
               {t('interests.mindAsComputer.description')}
             </p>
             <motion.div
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               <Link
                 to="/mind-computer"
                 className="inline-block bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-8 rounded-full hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300"
               >
                 {t('interests.mindAsComputer.explore')}
               </Link>
             </motion.div>
           </div>

        </div>
      </div>
    </div>
  );
};

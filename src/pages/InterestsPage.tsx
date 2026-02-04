import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Music, Gamepad2, BookOpen, Camera, Palette, Globe, Users, Activity, Brain, Leaf, ChefHat, Calendar, Home, TrendingUp, MessageSquare } from 'lucide-react';
import { ChakraCalendar } from '../components/ChakraCalendar';

export const InterestsPage: React.FC = () => {
  const [expandedCard, setExpandedCard] = React.useState<string | null>(null);

  const interests = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Meditation',
      description: 'Ik beoefen regelmatig meditatie om mijn geest te kalmeren, focus te verbeteren en innerlijke rust te vinden. Dit helpt me ook in mijn creatieve werk.',
      details: ['Mindfulness', 'Vipassana', 'Breathing Techniques', 'Mental Clarity', 'Stress Reduction'],
      link: '/topics/meditation'
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: 'Cultivation',
      description: 'Ik ben gepassioneerd over het kweken van planten en het verbinden met de natuur. Van kamerplanten tot moestuin - ik vind rust in het verzorgen van levende wezens.',
      details: ['Indoor Plants', 'Gardening', 'Sustainability', 'Plant Care', 'Nature Connection'],
      link: '/cultivation'
    },
    {
      icon: <ChefHat className="w-8 h-8" />,
      title: 'Cooking',
      description: 'Koken is voor mij een creatieve uitlaatklep en een manier om te experimenteren met smaken en technieken. Ik geniet van het proces van het maken van gezonde, lekkere maaltijden.',
      details: ['Healthy Cooking', 'Flavor Experimentation', 'Culinary Techniques', 'Meal Planning', 'Nutrition'],
      link: '/cooking'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Filosofie & Bewustzijn',
      description: 'Ik ben gefascineerd door de diepere vragen van bewustzijn, psychologie en hoe grote denkers door de geschiedenis onze kijk op de geest hebben gevormd.',
      details: ['Carl Jung', 'Bewustzijnsfilosofie', 'Psychologie', 'Filosofische Tradities', 'Mentale Modellen'],
      link: '/mind-computer#philosophers'
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'Sports & Adventure',
      description: 'Ik ben gepassioneerd over outdoor sporten en avontuur. Van slacklinen en boulderen tot snowboarden en surfen - ik hou van de uitdaging en vrijheid die deze sporten bieden.',
      details: ['Slacklining', 'Boulderen', 'Snowboarden', 'Surfen', 'Dagelijkse Training'],
      link: '/sports'
    },
    {
      icon: <Music className="w-8 h-8" />,
      title: 'Music',
      description: 'I have a deep passion for music, both listening and creating. I enjoy exploring various genres and experimenting with digital music production.',
      details: ['Electronic Music', 'Jazz', 'Classical', 'Digital Audio Workstations', 'Sound Design'],
      link: '/music'
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Learning',
      description: 'I\'m constantly seeking to expand my knowledge and skills, whether through books, online courses, or hands-on projects.',
      details: ['Technology Trends', 'Design Principles', 'New Programming Languages', 'Creative Techniques']
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: 'Photography',
      description: 'I enjoy capturing moments and exploring visual storytelling through photography and videography.',
      details: ['Digital Photography', 'Composition', 'Lighting', 'Post-Processing', 'Storytelling']
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: 'Art & Creativity',
      description: 'Creative expression is important to me, whether through digital art, traditional media, or innovative design solutions.',
      details: ['Digital Art', 'Sketching', 'Color Theory', 'Creative Problem Solving', 'Innovation']
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Travel & Culture',
      description: 'I love exploring different cultures and perspectives, which enriches my creative work and understanding of global design trends.',
      details: ['Cultural Exchange', 'Global Design', 'Language Learning', 'Cultural Sensitivity', 'Diverse Perspectives']
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: 'Gaming',
      description: 'Gaming has been a significant part of my life, inspiring my interest in technology and interactive experiences.',
      details: ['Strategy Games', 'RPGs', 'Indie Games', 'Game Development', 'Virtual Reality']
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Alternatieve Tijdvisualisatie',
      description: 'Ik ben gefascineerd door alternatieve manieren om tijd te ervaren. Via een 13-maanden chakra kalender (startend op 26 juli) verken ik hoe energie en bewustzijn samenhangen met onze tijdservaring.',
      details: ['13-Maanden Kalender', 'Chakra Ritme', 'Bewustzijn & Tijd', 'Energetische Cycli', 'Gregoriaanse Overlay']
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: 'Tuin & Huis Ontwerpen',
      description: 'Ontwerp en teken je eigen tuin en huis met verschillende werklagen. Van funderingen tot planten en water - creëer je perfecte ruimte.',
      details: ['2D Ontwerp', 'Werklagen', 'Planten Planning', 'Water Systemen', 'Lokaal Opslaan'],
      link: '/garden-designer'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Beleggen',
      description: 'Ik volg hoe inflatie mijn geld beïnvloedt en analyseer hoe verschillende investeringen presteren ten opzichte van inflatie. Van tech-aandelen tot goud - ik leer over financiële markten en vermogensopbouw.',
      details: ['Inflatie Tracking', 'Aandelen', 'Goud', 'Cryptocurrency', 'Vermogensopbouw'],
      link: '/beleggen'
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Moltbook Agent',
      description: 'Mijn AI agent op Moltbook waar ik vragen kan stellen en antwoorden kan geven op posts van andere agents. Een platform voor AI-to-AI communicatie en kennisuitwisseling.',
      details: ['AI Communicatie', 'Vragen Stellen', 'Antwoorden', 'Community', 'Kennisuitwisseling'],
      link: '/moltbook'
    },

  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom px-4 py-8">
        
        <div className="max-w-6xl mx-auto">
          <p className="text-lg text-white/80 text-center mb-12 leading-relaxed">
            Beyond my professional skills, I have diverse interests that shape my perspective and 
            contribute to my creative approach to problem-solving.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {interests.map((interest, index) => (
              <motion.div
                key={interest.title}
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
                        {interest.title === 'Music' ? 'Verken Live Coding & Muziek' :
                         interest.title === 'Filosofie & Bewustzijn' ? 'Verken Filosofen & Denkers' :
                         interest.title === 'Sports & Adventure' ? 'Verken Sporten & Avontuur' :
                         interest.title === 'Meditation' ? 'Verken Meditatie & Mindfulness' :
                         interest.title === 'Cultivation' ? 'Verken Kweekprojecten' :
                         interest.title === 'Cooking' ? 'Verken Recepten & Gerechten' :
                         interest.title === 'Tuin & Huis Ontwerpen' ? 'Start Ontwerper' :
                         interest.title === 'Beleggen' ? 'Verken Inflatie & Investeringen' :
                         interest.title === 'Moltbook Agent' ? 'Open Moltbook Agent' : 'Verken'}
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="block bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 group">
                    {interest.title === 'Alternatieve Tijdvisualisatie' ? (
                      // Special expandable card for Chakra Calendar
                      <>
                        <div
                          className="cursor-pointer"
                          onClick={() => setExpandedCard(expandedCard === interest.title ? null : interest.title)}
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
                                className={`w-5 h-5 transition-transform duration-300 ${expandedCard === interest.title ? 'rotate-180' : ''}`}
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
                              {expandedCard === interest.title ? 'Klik om te sluiten' : 'Klik om kalender te bekijken'}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Chakra Calendar */}
                        {expandedCard === interest.title && (
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
               How These Interests Shape My Work
             </h2>
             <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
               My diverse interests influence my approach to design and development. From music's rhythm 
               and structure to gaming's interactive storytelling, each interest brings unique perspectives 
               that help me create more engaging and innovative solutions. I believe that a well-rounded 
               individual creates more well-rounded work.
             </p>
           </div>

           {/* Mind as Computer Section */}
           <div className="mt-16 text-center">
             <h2 className="text-3xl font-bold text-white mb-6">
               The Mind as a Computer
             </h2>
             <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed mb-8">
               One of my fascinations lies in understanding how the human mind processes information
               like a computer, and how we can visualize these complex cognitive processes. This
               intersection of psychology, technology, and visualization drives my approach to
               creating intuitive user experiences.
             </p>
             <motion.div
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               <Link
                 to="/mind-computer"
                 className="inline-block bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-8 rounded-full hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300"
               >
                 Explore Interactive Diagrams
               </Link>
             </motion.div>
           </div>

        </div>
      </div>
    </div>
  );
};

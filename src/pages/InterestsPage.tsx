import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Music, Gamepad2, BookOpen, Camera, Palette, Globe, Users, Activity } from 'lucide-react';

export const InterestsPage: React.FC = () => {

  const interests = [
    {
      icon: <Music className="w-8 h-8" />,
      title: 'Music',
      description: 'I have a deep passion for music, both listening and creating. I enjoy exploring various genres and experimenting with digital music production.',
      details: ['Electronic Music', 'Jazz', 'Classical', 'Digital Audio Workstations', 'Sound Design'],
      link: '/music'
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
                         interest.title === 'Sports & Adventure' ? 'Verken Sporten & Avontuur' : 'Verken'}
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="block bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 group">
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

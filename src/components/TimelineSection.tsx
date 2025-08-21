import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, GraduationCap, Code, Users, Leaf } from 'lucide-react';

export const TimelineSection: React.FC = () => {
  const { t } = useTranslation();

  const timelineEvents = [
    {
      id: 1,
      year: '2025-heden',
      title: t('timeline.events.event1.title'),
      company: t('timeline.events.event1.company'),
      location: t('timeline.events.event1.location'),
      description: t('timeline.events.event1.description'),
      icon: Users,
      color: 'neon-green',
      achievements: t('timeline.events.event1.achievements', { returnObjects: true }) as string[]
    },
    {
      id: 2,
      year: '2021-2025',
      title: t('timeline.events.event2.title'),
      company: t('timeline.events.event2.company'),
      location: t('timeline.events.event2.location'),
      description: t('timeline.events.event2.description'),
      icon: GraduationCap,
      color: 'neon-blue',
      achievements: t('timeline.events.event2.achievements', { returnObjects: true }) as string[]
    },
    {
      id: 3,
      year: '2019-2020',
      title: t('timeline.events.event3.title'),
      company: t('timeline.events.event3.company'),
      location: t('timeline.events.event3.location'),
      description: t('timeline.events.event3.description'),
      icon: Leaf,
      color: 'neon-yellow',
      achievements: t('timeline.events.event3.achievements', { returnObjects: true }) as string[]
    },
    {
      id: 4,
      year: '2018',
      title: t('timeline.events.event4.title'),
      company: t('timeline.events.event4.company'),
      location: t('timeline.events.event4.location'),
      description: t('timeline.events.event4.description'),
      icon: Code,
      color: 'neon-pink',
      achievements: t('timeline.events.event4.achievements', { returnObjects: true }) as string[]
    }
  ];

  const skillsEvolution = [
    { skill: 'VS Code, C++, HTML, CSS, JavaScript', year: '2018', level: 25 },
    { skill: 'TypeScript, C#', year: '2021', level: 45 },
    { skill: 'SCSS, PHP, SQL', year: '2022', level: 55 },
    { skill: 'React, MongoDB', year: '2023', level: 70 },
    { skill: 'Python, TypeSriptReact', year: '2024', level: 85 },
    { skill: 'Kotlin, Java, Supabase, Cursor, Linux, IntelliJ', year: '2025', level: 65 }
  ];

  return (
    <section id="timeline" className="section-padding bg-dark-bg relative overflow-hidden">
      {/* Decoratieve achtergrond elementen */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-40 left-20 w-72 h-72 bg-neon-green rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-neon-blue rounded-full blur-3xl" />
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
            {t('timeline.title')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-neon-green to-neon-blue mx-auto rounded-full" />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-neon-green via-neon-blue to-neon-pink hidden sm:block" />

          {/* Timeline Events */}
          <div className="space-y-12">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative flex flex-col sm:flex-row items-center ${
                  index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`w-full sm:w-5/12 ${index % 2 === 0 ? 'sm:pr-8 sm:text-right' : 'sm:pl-8 sm:text-left'}`}>
                  <div className="bg-dark-secondary rounded-xl p-6 border border-white/10 hover:border-neon-green/50 transition-all duration-300 card-hover">
                    {/* Year Badge */}
                    <div className={`inline-block px-3 py-1 bg-${event.color}/20 text-${event.color} text-sm font-bold rounded-full mb-3`}>
                      {event.year}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2">
                      {event.title}
                    </h3>

                    {/* Company */}
                    <div className="flex items-center space-x-2 mb-3 text-neon-green">
                      <event.icon className="w-4 h-4" />
                      <span className="font-medium">{event.company}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-2 mb-4 text-white/60">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{event.location}</span>
                    </div>

                    {/* Description */}
                    <p className="text-white/80 text-sm leading-relaxed mb-4">
                      {event.description}
                    </p>

                    {/* Achievements */}
                    <ul className="space-y-1">
                      {event.achievements.map((achievement, achievementIndex) => (
                        <li key={achievementIndex} className="flex items-center space-x-2 text-sm text-white/70">
                          <div className={`w-2 h-2 bg-${event.color} rounded-full`} />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-dark-bg border-4 border-neon-green rounded-full z-10 hidden sm:block" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Skills Evolution */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            {t('timeline.skillsEvolution')}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {skillsEvolution.map((skill, index) => (
              <motion.div
                key={skill.skill}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
                className="bg-dark-secondary rounded-lg p-6 border border-white/10 hover:border-neon-green/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">{skill.skill}</h4>
                  <span className="text-neon-green font-bold">{skill.year}</span>
                </div>
                
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-3">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-green to-neon-blue rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: 1 + index * 0.1 }}
                    viewport={{ once: true }}
                  />
                </div>
                
                <div className="text-right">
                  <span className="text-neon-green font-bold">{skill.level}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-2xl p-8 border border-neon-green/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              {t('timeline.readyForNextChapter')}
            </h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              {t('timeline.nextChapterDescription')}
            </p>
            <motion.button
              className="bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-8 rounded-full hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {t('timeline.letsWorkTogether')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

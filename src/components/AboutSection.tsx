import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Code, Coffee, Heart, Zap } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: Coffee, value: '7+', label: t('about.experience') },
    { icon: Code, value: '10+', label: t('about.projects') },
    { icon: Heart, value: '∞', label: 'Passion' },
    { icon: Zap, value: '24/7', label: 'Learning' },
  ];

  const skills = [
    { name: 'Cursor', level: 95, color: 'neon-pink' },
    { name: 'React', level: 95, color: 'neon-blue' },
    { name: 'Supabase', level: 90, color: 'neon-yellow' },
    { name: 'Python', level: 85, color: 'neon-green' },
    { name: 'Next.js', level: 82, color: 'neon-purple' },
  ];

  return (
    <section 
      id="about" 
      className="section-padding bg-dark-secondary relative overflow-hidden"
      aria-labelledby="about-title"
    >
      {/* Decoratieve achtergrond elementen */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-5"
        aria-hidden="true"
        role="presentation"
      >
        <div className="absolute top-20 left-20 w-64 h-64 bg-neon-green rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-neon-blue rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 id="about-title" className="text-4xl md:text-5xl font-bold mb-6 neon-text">
            {t('about.title')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-neon-green to-neon-blue mx-auto rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Links - Persoonlijke foto en beschrijving */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Persoonlijke foto */}
            <div className="relative mb-8">
              <div className="w-80 h-80 mx-auto rounded-full overflow-hidden border-2 border-neon-green/30 shadow-2xl shadow-neon-green/20">
                <img 
                  src="/me.jpg" 
                  alt="Florian Thiers - Full Stack Developer en Software Engineer" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width="320"
                  height="320"
                />
              </div>
              <div 
                className="absolute -bottom-4 -right-4 w-20 h-20 bg-neon-pink/20 rounded-full border border-neon-pink/30 animate-pulse"
                aria-hidden="true"
                role="presentation"
              />
            </div>

            <p className="text-lg text-white/80 leading-relaxed mb-6">
              {t('about.description')}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6" role="list" aria-label="Experience Statistics">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-4 glass-effect rounded-lg"
                  role="listitem"
                >
                  <stat.icon className="w-8 h-8 text-neon-green mx-auto mb-2" aria-hidden="true" />
                  <div className="text-2xl font-bold text-neon-green" aria-label={`${stat.value} ${stat.label}`}>{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Rechts - Skills */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-8 text-white">
              {t('about.skills')}
            </h3>

            <div className="space-y-6" role="list" aria-label="Technical Skills">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  viewport={{ once: true }}
                  role="listitem"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{skill.name}</span>
                    <span className={`font-bold ${
                      skill.color === 'neon-blue' ? 'text-blue-500' :
                      skill.color === 'neon-pink' ? 'text-pink-500' :
                      skill.color === 'neon-green' ? 'text-green-500' :
                      skill.color === 'neon-yellow' ? 'text-yellow-500' :
                      skill.color === 'neon-purple' ? 'text-purple-500' :
                      'text-blue-500'
                    }`} aria-label={`${skill.name} skill level: ${skill.level}%`}>{skill.level}%</span>
                  </div>
                  <div 
                    className="w-full bg-white/10 rounded-full h-3 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={skill.level}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${skill.name} skill progress: ${skill.level}%`}
                  >
                    <motion.div
                      className={`h-full rounded-full ${
                        skill.color === 'neon-blue' ? 'bg-blue-500' :
                        skill.color === 'neon-pink' ? 'bg-pink-500' :
                        skill.color === 'neon-green' ? 'bg-green-500' :
                        skill.color === 'neon-yellow' ? 'bg-yellow-500' :
                        skill.color === 'neon-purple' ? 'bg-purple-500' :
                        'bg-blue-500'
                      }`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Extra info */}
            <div className="mt-8 p-6 glass-effect rounded-lg">
              <h4 className="text-lg font-semibold text-neon-green mb-3">
                {t('about.whatDrivesMe')}
              </h4>
              <ul className="space-y-2 text-white/80" role="list" aria-label="What drives me">
                <li className="flex items-center space-x-2" role="listitem">
                  <div className="w-2 h-2 bg-neon-green rounded-full" aria-hidden="true" />
                  <span>{t('about.drive1')}</span>
                </li>
                <li className="flex items-center space-x-2" role="listitem">
                  <div className="w-2 h-2 bg-neon-blue rounded-full" aria-hidden="true" />
                  <span>{t('about.drive2')}</span>
                </li>
                <li className="flex items-center space-x-2" role="listitem">
                  <div className="w-2 h-2 bg-neon-pink rounded-full" aria-hidden="true" />
                  <span>{t('about.drive3')}</span>
                </li>
                <li className="flex items-center space-x-2" role="listitem">
                  <div className="w-2 h-2 bg-neon-yellow rounded-full" aria-hidden="true" />
                  <span>{t('about.drive4')}</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

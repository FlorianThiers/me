import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Code,
  Database,
  Globe,
  Wrench,
  Zap,
  TrendingUp,
  Shield
} from 'lucide-react';

export const SkillsSection: React.FC = () => {
  const { t } = useTranslation();

  const skillCategories = [
    {
      id: 'languages',
      title: t('skills.languages'),
      icon: Code,
      color: 'neon-orange',
      skills: [
        { name: 'JavaScript', level: 88, icon: '🟨' },
        { name: 'Python', level: 85, icon: '🐍' },
        { name: 'SQL', level: 82, icon: '🗄️' },
        { name: 'Java', level: 75, icon: '☕' },
        { name: 'C++', level: 70, icon: '⚡' },
        { name: 'C#', level: 68, icon: '💎' },
        { name: 'Kotlin', level: 60, icon: '💜' },
      ]
    },
    {
      id: 'frontend',
      title: t('skills.frontend'),
      icon: Globe,
      color: 'neon-blue',
      skills: [
        { name: 'React', level: 95, icon: '⚛️' },
        { name: 'TypeScript', level: 90, icon: '📘' },
        { name: 'Tailwind CSS', level: 85, icon: '🎨' },
        { name: 'HTML', level: 80, icon: '🌐' },
        { name: 'Three.js', level: 75, icon: '🎮' },
        { name: 'CSS', level: 70, icon: '🟪' },
        { name: 'SCSS', level: 65, icon: '🎨' },
      ]
    },
    {
      id: 'backend',
      title: t('skills.backend'),
      icon: Code,
      color: 'neon-green',
      skills: [
        { name: 'Python', level: 85, icon: '🐍' },
        { name: 'FastAPI', level: 83, icon: '⚡' },
        { name: 'Node.js', level: 82, icon: '🟢' },
        { name: 'PHP', level: 80, icon: '🐘' },
        { name: 'Express.js', level: 78, icon: '🚀' },
        { name: 'REST APIs', level: 76, icon: '🌐' },
        { name: 'GraphQL', level: 75, icon: '🔗' },
      ]
    },
    {
      id: 'databases',
      title: t('skills.databases'),
      icon: Database,
      color: 'neon-yellow',
      skills: [
        { name: 'Supabase', level: 90, icon: '⚡' },
        { name: 'PostgreSQL', level: 85, icon: '🐘' },
        { name: 'MySQL', level: 80, icon: '🐬' },
        { name: 'MongoDB', level: 70, icon: '🍃' },
        { name: 'Firebase', level: 65, icon: '🔥' },
      ]
    },
    {
      id: 'tools',
      title: t('skills.tools'),
      icon: Wrench,
      color: 'neon-pink',
      skills: [
        { name: 'Cursor', level: 90, icon: '✏️' },
        { name: 'VS Code', level: 88, icon: '💻' },
        { name: 'Git', level: 80, icon: '📚' },
        { name: 'IntelliJ', level: 75, icon: '🧠' },
        { name: 'Linux', level: 60, icon: '🐧' },
      ]
    },
    {
      id: 'frameworks',
      title: t('skills.frameworks'),
      icon: Zap,
      color: 'neon-purple',
      skills: [
        { name: 'Next.js', level: 91, icon: '⚡' },
        { name: 'CMS', level: 85, icon: '📝' },
        { name: 'Express.js', level: 78, icon: '🚀' },
        { name: 'Laravel', level: 75, icon: '💜' },
        { name: 'React Native', level: 60, icon: '📱' },
        
      ]
    },
  ];

  const additionalSkills = [
    { name: 'Machine Learning', icon: '🧠', description: 'AI-driven development, TensorFlow, PyTorch' },
    { name: 'Mobile Development', icon: '📱', description: 'React Native, Flutter, Mobile-first design' },
    { name: 'Testing', icon: '🧪', description: 'Jest, Cypress, Unit & Integration testing' },
    { name: 'Performance', icon: '⚡', description: 'Web Vitals, Lighthouse, Optimization' },
    { name: 'IoT & Robotics', icon: '🤖', description: 'Vijverstofzuigers, Robot development' },
    { name: 'AI Integration', icon: '🤖', description: 'ChatGPT, AI-driven solutions' },
  ];

  // Functie om de juiste kleur te krijgen voor percentage bars
  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; bgOpacity: string } } = {
      'neon-blue': { bg: 'bg-blue-500', text: 'text-blue-500', bgOpacity: 'bg-blue-500/20' },
      'neon-green': { bg: 'bg-green-500', text: 'text-green-500', bgOpacity: 'bg-green-500/20' },
      'neon-yellow': { bg: 'bg-yellow-500', text: 'text-yellow-500', bgOpacity: 'bg-yellow-500/20' },
      'neon-pink': { bg: 'bg-pink-500', text: 'text-pink-500', bgOpacity: 'bg-pink-500/20' },
      'neon-purple': { bg: 'bg-purple-500', text: 'text-purple-500', bgOpacity: 'bg-purple-500/20' },
      'neon-orange': { bg: 'bg-orange-500', text: 'text-orange-500', bgOpacity: 'bg-orange-500/20' },
    };
    return colorMap[color] || { bg: 'bg-blue-500', text: 'text-blue-500', bgOpacity: 'bg-blue-500/20' };
  };

  return (
    <section id="skills" className="section-padding bg-dark-secondary relative overflow-hidden">
      {/* Decoratieve achtergrond elementen */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-32 left-32 w-80 h-80 bg-neon-green rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-neon-purple rounded-full blur-3xl" />
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
            {t('skills.title')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-neon-green to-neon-blue mx-auto rounded-full" />
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-16">
          {skillCategories.map((category, categoryIndex) => {
            const colorClasses = getColorClasses(category.color);
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className="bg-dark-bg rounded-xl p-6 border border-white/10 hover:border-neon-green/50 transition-all duration-300 card-hover"
              >
                {/* Category Header */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-3 ${colorClasses.bgOpacity} rounded-lg`}>
                    <category.icon className={`w-6 h-6 ${colorClasses.text}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{category.title}</h3>
                </div>

                {/* Skills List */}
                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (skillIndex * 0.05) }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{skill.icon}</span>
                          <span className="text-white font-medium">{skill.name}</span>
                        </div>
                        <span className={`${colorClasses.text} font-bold text-sm`}>
                          {skill.level}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className={`h-full ${colorClasses.bg} rounded-full`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          transition={{ duration: 1, delay: (categoryIndex * 0.1) + (skillIndex * 0.05) + 0.3 }}
                          viewport={{ once: true }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Skills */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl font-bold text-white mb-8">
            {t('skills.specializedExpertise')}
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {additionalSkills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-dark-bg rounded-lg p-6 border border-white/10 hover:border-neon-green/50 transition-all duration-300 text-center hover:scale-105">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {skill.icon}
                </div>
                <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-neon-green transition-colors duration-300">
                  {skill.name}
                </h4>
                <p className="text-white/60 text-sm">
                  {skill.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Skills Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-2xl p-8 border border-neon-green/30">
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="w-6 h-6 text-neon-green" />
                <span className="text-white font-medium">{t('skills.alwaysLearning')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-6 h-6 text-neon-blue" />
                <span className="text-white font-medium">{t('skills.fastDevelopment')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-6 h-6 text-neon-pink" />
                <span className="text-white font-medium">{t('skills.qualityCode')}</span>
              </div>
            </div>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              {t('skills.summary')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

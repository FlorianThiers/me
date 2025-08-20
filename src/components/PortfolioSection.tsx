import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Globe } from 'lucide-react';

export const PortfolioSection: React.FC = () => {
  const { t } = useTranslation();

  const projects = [
    {
      id: 1,
      title: 'ParkSports',
      description: 'Community platform for sports enthusiasts. Built with modern web technologies and focused on user engagement and community building.',
      image: '🏃‍♂️',
      technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      github: 'https://github.com/FlorianThiers',
      live: '#',
      category: 'Full-Stack'
    },
    {
      id: 2,
      title: 'ImmoGen',
      description: 'AI-driven real estate platform combining machine learning with property management. Built with Python and modern web technologies.',
      image: '🏠',
      technologies: ['Python', 'FastAPI', 'React', 'Machine Learning'],
      github: 'https://github.com/FlorianThiers',
      live: '#',
      category: 'AI/ML'
    },
    {
      id: 3,
      title: 'Vijverstofzuiger Robot',
      description: 'IoT-powered pool cleaning robot with AI integration. Combines hardware engineering with smart software solutions.',
      image: '🤖',
      technologies: ['Python', 'IoT', 'AI', 'Hardware'],
      github: 'https://github.com/FlorianThiers',
      live: '#',
      category: 'IoT/Robotics'
    },
    {
      id: 4,
      title: 'HighlineHeaven',
      description: 'Webpage for slackliners built with JavaScript. Focus on performance and user experience for the slacklining community.',
      image: '🧗‍♂️',
      technologies: ['JavaScript', 'HTML', 'CSS', 'Performance'],
      github: 'https://github.com/FlorianThiers/HighlineHeaven',
      live: '#',
      category: 'Web Development'
    },
    {
      id: 5,
      title: 'Jump-Thrs Game',
      description: 'My first game development project. A fun and engaging game built with JavaScript and modern web technologies.',
      image: '🎮',
      technologies: ['JavaScript', 'Game Development', 'HTML5', 'CSS3'],
      github: 'https://github.com/FlorianThiers/jump-thrs',
      live: '#',
      category: 'Game Development'
    },
    {
      id: 6,
      title: 'Portfolio Website',
      description: 'Interactive portfolio website with Mandelbrot background, built with React, TypeScript, and Three.js.',
      image: '💻',
      technologies: ['React', 'TypeScript', 'Three.js', 'Tailwind CSS'],
      github: 'https://github.com/FlorianThiers',
      live: '#',
      category: 'Portfolio'
    }
  ];

  const categories = ['All', 'Full-Stack', 'AI/ML', 'IoT/Robotics', 'Web Development', 'Game Development', 'Portfolio'];

  return (
    <section id="portfolio" className="section-padding bg-dark-bg relative overflow-hidden">
      {/* Decoratieve achtergrond elementen */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-40 right-20 w-96 h-96 bg-neon-purple rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-72 h-72 bg-neon-yellow rounded-full blur-3xl" />
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
            {t('portfolio.title')}
          </h2>
          <p className="text-xl text-white/70 mb-8">
            {t('portfolio.subtitle')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-neon-green to-neon-blue mx-auto rounded-full" />
        </motion.div>

        {/* Project Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-dark-secondary rounded-xl overflow-hidden border border-white/10 hover:border-neon-green/50 transition-all duration-300 card-hover">
                {/* Project Image */}
                <div className="h-48 bg-gradient-to-br from-neon-green/20 to-neon-blue/20 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                  {project.image}
                </div>

                {/* Project Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="inline-block px-3 py-1 bg-neon-green/20 text-neon-green text-sm font-medium rounded-full mb-3">
                    {project.category}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-neon-green transition-colors duration-300">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="mb-4">
                    <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                      {t('portfolio.technologies')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-md border border-white/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex space-x-3">
                    <motion.a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-dark-bg hover:bg-neon-green/20 text-white hover:text-neon-green border border-white/20 hover:border-neon-green/50 rounded-lg transition-all duration-300 group-hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Github size={16} />
                      <span className="text-sm font-medium">Code</span>
                    </motion.a>
                    
                    <motion.a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-medium rounded-lg hover:shadow-lg hover:shadow-neon-green/30 transition-all duration-300 group-hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Globe size={16} />
                      <span className="text-sm font-medium">{t('portfolio.viewProject')}</span>
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-white/70 mb-6 text-lg">
            Interested in working together? Let's discuss your next project!
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
            Get In Touch
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

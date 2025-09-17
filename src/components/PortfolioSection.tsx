import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Github, Globe } from 'lucide-react';

export const PortfolioSection: React.FC = () => {
  const { t } = useTranslation();

  const projects = [
    {
      id: 1,
      title: '3D Room Experience',
      description: 'Immersive 3D room experience with interactive storytelling elements. Features atmospheric design, animations, and narrative progression through a mysterious room.',
      image: '/projects/room.png',
      technologies: ['Three.js', 'JavaScript', 'WebGL', '3D Modeling'],
      github: 'https://github.com/FlorianThiers',
      live: 'https://3-d-room-six.vercel.app/',
      category: 'Web Development'
    },
    {
      id: 2,
      title: 'Jump-Thrs Game',
      description: 'Interactive web-based game with engaging gameplay mechanics. My first game development project showcasing creative programming and user experience design.',
      image: '/projects/jump.png',
      technologies: ['JavaScript', 'Game Development', 'HTML5', 'CSS3'],
      github: 'https://github.com/FlorianThiers/jump-thrs',
      live: 'https://jump-thrs.vercel.app/',
      category: 'Game Development'
    },
    {
      id: 3,
      title: 'ImmoGen',
      description: 'AI-driven real estate platform combining machine learning with property management. Advanced property analysis and management system.',
      image: '/projects/immogen.png',
      technologies: ['Python', 'FastAPI', 'React', 'Machine Learning'],
      github: 'https://github.com/FlorianThiers',
      live: 'https://immo-gen-olive.vercel.app/',
      category: 'AI/ML'
    },
    {
      id: 4,
      title: 'Vijverstofzuigers Website',
      description: 'Professional website for pool cleaning services with modern React frontend and Supabase backend. Features dynamic content management, contact forms, and responsive design.',
      image: '/projects/vijverstofzuigers.png',
      technologies: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
      github: 'https://github.com/FlorianThiers',
      live: 'https://vijverstofzuiger.vercel.app/',
      category: 'Full-Stack'
    },
    {
      id: 5,
      title: 'ParkSports Community',
      description: 'Community platform for slackline and parksports enthusiasts. Features spot discovery, events, community interaction, and learning resources. Built with modern web technologies.',
      image: '/projects/parksports.png',
      technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      github: 'https://github.com/FlorianThiers',
      live: 'https://www.parksports.space/',
      category: 'Full-Stack'
    },
    {
      id: 6,
      title: 'Portfolio Website',
      description: 'Interactive portfolio website with animated Mandelbrot background, built with React, TypeScript, and Three.js. Features dynamic color-changing fractals and smooth animations.',
      image: '/projects/portfolio.png',
      technologies: ['React', 'TypeScript', 'Three.js', 'Tailwind CSS'],
      github: 'https://github.com/FlorianThiers',
      live: 'https://florian-tau.vercel.app/',
      category: 'Portfolio'
    },
    {
      id: 7,
      title: 'Corridor - Urban Sport Hub',
      description: 'One-page website for Corridor, the Urban Sport Hub of Gentbrugge. Features modern design showcasing sports facilities, community activities, and events under the E17 viaduct.',
      image: '/projects/corridor.png',
      technologies: ['HTML5', 'Tailwind CSS', 'GSAP', 'Responsive Design'],
      github: 'https://github.com/FlorianThiers',
      live: 'https://corridor-blond.vercel.app/',
      category: 'Web Development'
    }
  ];

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
          {projects.sort((a, b) => b.id - a.id).map((project, index) => (
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
                <div className="h-48 bg-gradient-to-br from-neon-green/20 to-neon-blue/20 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
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


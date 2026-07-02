import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, ExternalLink, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { CONTACT, CV } from '../config/contact';
import { getCvContent } from '../data/cvContent';

export const CvPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const content = getCvContent(i18n.language);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen pt-20 pb-16 cv-page">
      {/* Screen-only toolbar */}
      <div className="cv-no-print container-custom px-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-neon-green transition-colors"
          >
            <ArrowLeft size={18} />
            {t('cv.backHome')}
          </Link>
          <div className="flex flex-wrap gap-3">
            <motion.button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-2.5 px-5 rounded-full"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Download size={18} />
              {t('cv.saveAsPdf')}
            </motion.button>
          </div>
        </div>
        <p className="text-white/50 text-sm mt-3">{t('cv.printHint')}</p>
      </div>

      <article className="cv-sheet container-custom px-4 max-w-4xl mx-auto">
        <header className="cv-header border-b border-white/10 pb-6 mb-6">
          <p className="text-neon-green font-mono text-sm mb-2 uppercase tracking-widest">CV</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{CONTACT.name}</h1>
          <p className="text-xl text-white/80 mb-4">{content.headline}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
            <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-1.5 hover:text-neon-green">
              <Mail size={14} />
              {CONTACT.email}
            </a>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} />
              {CONTACT.location}
            </span>
            <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-neon-green">
              <Github size={14} />
              GitHub
            </a>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-neon-green">
              <Linkedin size={14} />
              LinkedIn
            </a>
            <a href={CONTACT.website} className="inline-flex items-center gap-1.5 hover:text-neon-green">
              <ExternalLink size={14} />
              {CONTACT.website.replace('https://', '')}
            </a>
          </div>
          <p className="text-xs text-white/40 mt-4">
            {t('cv.updated')}: {CV.updatedAt}
          </p>
        </header>

        <section className="cv-section mb-6">
          <h2 className="cv-section-title">{t('cv.summary')}</h2>
          <p className="text-white/80 leading-relaxed">{content.summary}</p>
        </section>

        <section className="cv-section mb-6">
          <h2 className="cv-section-title">{t('cv.experience')}</h2>
          <div className="space-y-5">
            {content.experience.map((job) => (
              <div key={`${job.period}-${job.org}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-2">
                  <h3 className="font-semibold text-white">{job.role}</h3>
                  <span className="text-sm text-neon-green font-mono">{job.period}</span>
                </div>
                <p className="text-white/60 text-sm mb-2">
                  {job.org} · {job.location}
                </p>
                <ul className="list-disc list-inside space-y-1 text-white/75 text-sm">
                  {job.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="cv-section mb-6">
          <h2 className="cv-section-title">{t('cv.selectedProjects')}</h2>
          <div className="space-y-4">
            {content.projects.map((project) => (
              <div key={project.name}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="font-semibold text-white">
                    {project.url ? (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-neon-green">
                        {project.name}
                      </a>
                    ) : (
                      project.name
                    )}
                  </h3>
                  <span className="text-xs text-white/50 font-mono">{project.stack}</span>
                </div>
                <p className="text-white/75 text-sm mt-1">{project.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8 mb-6">
          <section className="cv-section">
            <h2 className="cv-section-title">{t('cv.skills')}</h2>
            <div className="space-y-3">
              {content.skills.map((group) => (
                <div key={group.group}>
                  <h3 className="text-sm font-semibold text-neon-blue mb-1">{group.group}</h3>
                  <p className="text-sm text-white/75">{group.items.join(' · ')}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="cv-section">
            <h2 className="cv-section-title">{t('cv.education')}</h2>
            <div className="space-y-3 mb-6">
              {content.education.map((edu) => (
                <div key={`${edu.period}-${edu.title}`}>
                  <p className="font-semibold text-white">{edu.title}</p>
                  <p className="text-sm text-white/60">
                    {edu.org} · {edu.period}
                  </p>
                </div>
              ))}
            </div>
            <h2 className="cv-section-title">{t('cv.languages')}</h2>
            <p className="text-sm text-white/75">{content.languages.join(' · ')}</p>
          </section>
        </div>
      </article>
    </div>
  );
};

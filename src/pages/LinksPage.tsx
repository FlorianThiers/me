import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { StaticFractalBackground } from '../components/orbit/StaticFractalBackground';
import { OrbitPanel } from '../components/orbit/OrbitPanel';
import { MANDELBROT_SPOTS } from '../data/pageMandelbrotConfig';
import { CONTACT } from '../config/contact';
import {
  BIO_LINK_ITEMS,
  getVisibleBioLinkSections,
  isExternalBioLink,
} from '../data/links';

const PAGE_TITLE = 'Florian Thiers — Links';
const PAGE_DESCRIPTION =
  'All my links in one place — portfolio, projects, socials, and contact.';

function useLinksPageMeta() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = PAGE_TITLE;

    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', PAGE_DESCRIPTION);

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== null) {
        meta.setAttribute('content', previousDescription);
      }
    };
  }, []);
}

const linkButtonClass =
  'flex w-full min-h-[60px] items-center gap-4 rounded-xl border border-white/10 bg-dark-secondary/80 px-4 sm:px-5 py-3.5 text-left no-underline text-white transition-all duration-300 hover:border-neon-green/50 hover:bg-dark-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-green group';

type BioLinkButtonProps = {
  label: string;
  url: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
};

function BioLinkButton({ label, url, icon: Icon }: BioLinkButtonProps) {
  const external = isExternalBioLink(url);

  const inner = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-neon-green group-hover:text-neon-blue transition-colors">
        <Icon size={24} aria-hidden className="shrink-0" />
      </span>
      <span className="flex-1 font-semibold text-lg leading-snug group-hover:text-neon-green transition-colors">
        {label}
      </span>
      {external ? (
        <ExternalLink className="h-5 w-5 text-white/35 group-hover:text-neon-green/80 shrink-0" aria-hidden />
      ) : (
        <span className="text-xs uppercase tracking-wider text-white/40 group-hover:text-neon-green/70 shrink-0">
          On site
        </span>
      )}
    </>
  );

  return (
    <li>
      {external ? (
        <a href={url} className={linkButtonClass} target="_blank" rel="noopener noreferrer">
          {inner}
        </a>
      ) : url.startsWith('/#') ? (
        <a href={url} className={linkButtonClass}>
          {inner}
        </a>
      ) : (
        <Link to={url} className={linkButtonClass}>
          {inner}
        </Link>
      )}
    </li>
  );
}

export const LinksPage: React.FC = () => {
  useLinksPageMeta();
  const sections = getVisibleBioLinkSections(BIO_LINK_ITEMS);

  return (
    <div className="relative min-h-screen min-h-[100svh] overflow-hidden">
      <StaticFractalBackground view={MANDELBROT_SPOTS.overview} insetClassName="inset-0" />

      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-dark-bg/75 via-dark-bg/55 to-dark-bg/90"
        aria-hidden
      />

      <section
        className="section-padding relative z-10 pt-24 sm:pt-28 pb-20 bg-dark-bg/30 px-2 sm:px-4"
        aria-labelledby="links-page-title"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.07] pointer-events-none" aria-hidden>
          <div className="absolute top-24 left-10 w-64 h-64 bg-neon-green rounded-full blur-3xl" />
          <div className="absolute bottom-32 right-10 w-80 h-80 bg-neon-blue rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-neon-pink rounded-full blur-3xl opacity-60" />
        </div>

        <div className="container-custom relative z-10 px-1 sm:px-4 max-w-2xl mx-auto">
          <motion.header
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12"
          >
            <div className="relative mb-8 inline-block">
              <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-full overflow-hidden border-2 border-neon-green/40 shadow-2xl shadow-neon-green/20">
                <img
                  src="/me.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                  width={144}
                  height={144}
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div
                className="absolute -bottom-2 -right-2 w-16 h-16 bg-neon-pink/20 rounded-full border border-neon-pink/30 animate-pulse"
                aria-hidden
              />
            </div>

            <h1 id="links-page-title" className="text-5xl sm:text-6xl font-bold mb-4 neon-text">
              {CONTACT.name}
            </h1>
            <p className="text-xl sm:text-2xl text-white/70 mb-6 max-w-md mx-auto">{PAGE_DESCRIPTION}</p>
            <div className="w-28 h-1 bg-gradient-to-r from-neon-green to-neon-blue mx-auto rounded-full" />
          </motion.header>

          <OrbitPanel
            title="Links"
            titleClassName="text-neon-green text-sm sm:text-base"
            className="orbit-readable-panel border-white/10 p-5 sm:p-7"
          >
            {sections.map((section) => (
              <div
                key={section.id}
                className={
                  section.heading ? 'mt-8 pt-4 border-t border-white/10 first:mt-0 first:pt-0 first:border-t-0' : ''
                }
              >
                {section.heading ? (
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neon-blue mb-4">
                    {section.heading}
                  </h3>
                ) : null}
                <ul className="space-y-3.5 list-none m-0 p-0">
                  {section.items.map((item) => (
                    <BioLinkButton
                      key={item.label}
                      label={item.label}
                      url={item.url as string}
                      icon={item.icon}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </OrbitPanel>

          <p className="text-center text-white/50 text-base mt-10 font-mono">
            <Link to="/" className="text-neon-green/80 hover:text-neon-green transition-colors no-underline">
              ← Back to MySpace
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

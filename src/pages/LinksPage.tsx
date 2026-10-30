import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { CONTACT } from '../config/contact';
import {
  BIO_LINK_ITEMS,
  getVisibleBioLinks,
  isExternalBioLink,
} from '../data/links';

const PAGE_TITLE = 'Florian Thiers — Links';
const PAGE_DESCRIPTION =
  'Quick links to Florian Thiers — website, Instagram, Urban Culture, GitHub, and contact.';

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

export const LinksPage: React.FC = () => {
  useLinksPageMeta();
  const links = getVisibleBioLinks(BIO_LINK_ITEMS);

  return (
    <div className="min-h-screen min-h-[100svh] bg-dark-bg relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0, 255, 136, 0.15), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(0, 136, 255, 0.12), transparent)',
        }}
      />

      <div className="relative z-10 section-padding pt-24 pb-16 flex flex-col items-center">
        <motion.header
          className="text-center mb-10 max-w-md w-full px-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="mx-auto mb-4 h-20 w-20 rounded-full glass-effect flex items-center justify-center neon-border">
            <span className="text-2xl font-bold neon-text" aria-hidden>
              FT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{CONTACT.name}</h1>
          <p className="text-white/60 text-sm sm:text-base">{PAGE_DESCRIPTION}</p>
        </motion.header>

        <ul className="w-full max-w-md space-y-3 px-2 list-none m-0 p-0">
          {links.map((item, index) => {
            const Icon = item.icon;
            const url = item.url as string;
            const external = isExternalBioLink(url);

            const className =
              'group flex w-full items-center gap-3 rounded-xl glass-effect card-hover px-4 py-3.5 sm:py-4 text-left no-underline text-white border border-white/10 hover:border-neon-green/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-green';

            const inner = (
              <>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-neon-green">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex-1 font-medium text-base">{item.label}</span>
                <ChevronRight
                  className="h-5 w-5 text-white/30 group-hover:text-neon-green/80 transition-colors shrink-0"
                  aria-hidden
                />
              </>
            );

            return (
              <motion.li
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                {external ? (
                  <a
                    href={url}
                    className={className}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {inner}
                  </a>
                ) : url.startsWith('/#') ? (
                  <a href={url} className={className}>
                    {inner}
                  </a>
                ) : (
                  <Link to={url} className={className}>
                    {inner}
                  </Link>
                )}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

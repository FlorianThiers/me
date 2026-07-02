/** Single source of truth for public contact + CV links */
export const CONTACT = {
  name: 'Florian Thiers',
  email: 'florthiers@gmail.com',
  location: 'Gent, Belgium',
  github: 'https://github.com/FlorianThiers',
  linkedin: 'https://www.linkedin.com/in/florian-thiers-2908ba305/',
  website: 'https://florian-tau.vercel.app',
  /** Set when you want phone shown on the site */
  phone: null as string | null,
} as const;

export const CV = {
  route: '/cv',
  updatedAt: '2026-07-02',
} as const;

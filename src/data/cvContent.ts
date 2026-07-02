import { CONTACT } from '../config/contact';

export type CvLocale = 'en' | 'nl' | 'es';

export interface CvContent {
  headline: string;
  summary: string;
  experience: Array<{
    period: string;
    role: string;
    org: string;
    location: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    stack: string;
    description: string;
    url?: string;
  }>;
  skills: Array<{ group: string; items: string[] }>;
  education: Array<{
    period: string;
    title: string;
    org: string;
  }>;
  languages: string[];
}

const sharedProjects = [
  {
    name: 'Servelec E-stock Platform',
    stack: 'Next.js, TypeScript, Supabase, TIP/Outlook',
    description: 'B2B ops platform: product lifecycle, RMA, warehouse tasks, Nouvelec invoice parsing, multi-brand admin.',
  },
  {
    name: 'Urban Culture Gent',
    stack: 'Next.js 16, TypeScript, React 19',
    description: 'Umbrella hub for ParkSports and Corridor — urban sports & culture brand site for Ghent.',
    url: 'https://urban-culture-ghent.vercel.app/',
  },
  {
    name: 'Vijverstofzuigers',
    stack: 'React, TypeScript, Supabase, Tailwind',
    description: 'Professional pool-cleaning site with CMS-style content, contact flows and responsive UX.',
    url: 'https://vijverstofzuiger.vercel.app/',
  },
  {
    name: 'ParkSports',
    stack: 'React, TypeScript, Next.js',
    description: 'Community platform for slackline and parksports — spots, events and member interaction.',
    url: 'https://www.parksports.space/',
  },
  {
    name: 'Corridor — Urban Sport Hub',
    stack: 'HTML, Tailwind, GSAP',
    description: 'One-page marketing site for an urban sports hub in Gentbrugge.',
    url: 'https://corridor-blond.vercel.app/',
  },
];

const contentByLocale: Record<CvLocale, CvContent> = {
  en: {
    headline: 'Full-Stack Developer · React · TypeScript · Python · AI workflows',
    summary:
      'Developer with 7+ years of hands-on experience. Builds the Servelec E-stock platform and Urban Culture hub (ParkSports + Corridor) while serving on the LifeGroup board. Side projects include ImmoGen and client sites.',
    experience: [
      {
        period: '2025 — present',
        role: 'Developer & board member',
        org: 'LifeGroup · Servelec · Urban Culture',
        location: 'Belgium',
        bullets: [
          'Ship and maintain the Servelec E-stock platform (product lifecycle, RMA, warehouse, TIP/Outlook).',
          'Combine engineering with board responsibilities at LifeGroup.',
          'Drive automation, integrations and pragmatic delivery in a small team.',
        ],
      },
      {
        period: '2021 — 2025',
        role: 'Web development (diploma track + projects)',
        org: 'Professional education & freelance',
        location: 'Belgium',
        bullets: [
          '4-year web development programme — diploma completed.',
          'Built portfolio of client and personal projects (React, TypeScript, Supabase).',
          'Strengthened full-stack delivery: APIs, auth, deployments on Vercel.',
        ],
      },
    ],
    projects: sharedProjects,
    skills: [
      { group: 'Frontend', items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Three.js'] },
      { group: 'Backend', items: ['Python', 'FastAPI', 'Node.js', 'REST APIs', 'Supabase'] },
      { group: 'Data & tools', items: ['PostgreSQL', 'Git', 'Vercel', 'Cursor', 'Linux'] },
      { group: 'Focus', items: ['Product prototyping', 'AI-assisted dev', 'Sustainable tech', 'i18n'] },
    ],
    education: [
      { period: '2021 — 2025', title: 'Web Development', org: 'Diploma — Belgium' },
      { period: '2019 — 2020', title: 'Plant Technical Sciences', org: 'Diploma — Belgium' },
    ],
    languages: ['Dutch (native)', 'English (fluent)', 'French (working)', 'Spanish (basic)'],
  },
  nl: {
    headline: 'Full-Stack Developer · React · TypeScript · Python · AI workflows',
    summary:
      'Developer met 7+ jaar praktijkervaring. Bouwt het Servelec E-stock platform en de Urban Culture hub (ParkSports + Corridor) als bestuurder bij LifeGroup. Side projects: ImmoGen en klantsites.',
    experience: [
      {
        period: '2025 — heden',
        role: 'Developer & bestuurder',
        org: 'LifeGroup · Servelec · Urban Culture',
        location: 'België',
        bullets: [
          'Ontwikkelt en onderhoudt het Servelec E-stock platform (product lifecycle, RMA, magazijn, TIP/Outlook).',
          'Combineert engineering met bestuursrollen bij LifeGroup.',
          'Automation, integraties en pragmatische oplevering in een klein team.',
        ],
      },
      {
        period: '2021 — 2025',
        role: 'Webdevelopment (opleiding + projecten)',
        org: 'Professionele opleiding & freelance',
        location: 'België',
        bullets: [
          '4-jarige webdevelopment-opleiding — diploma behaald.',
          'Portfolio van klant- en persoonlijke projecten (React, TypeScript, Supabase).',
          'Full-stack delivery: API\'s, auth, deployments op Vercel.',
        ],
      },
    ],
    projects: sharedProjects,
    skills: [
      { group: 'Frontend', items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Three.js'] },
      { group: 'Backend', items: ['Python', 'FastAPI', 'Node.js', 'REST API\'s', 'Supabase'] },
      { group: 'Data & tools', items: ['PostgreSQL', 'Git', 'Vercel', 'Cursor', 'Linux'] },
      { group: 'Focus', items: ['Product prototyping', 'AI-assisted development', 'Duurzame tech', 'i18n'] },
    ],
    education: [
      { period: '2021 — 2025', title: 'Webdevelopment', org: 'Diploma — België' },
      { period: '2019 — 2020', title: 'Plantechnische wetenschappen', org: 'Diploma — België' },
    ],
    languages: ['Nederlands (moedertaal)', 'Engels (vlot)', 'Frans (werk)', 'Spaans (basis)'],
  },
  es: {
    headline: 'Desarrollador Full-Stack · React · TypeScript · Python · flujos con IA',
    summary:
      'Desarrollador con más de 7 años de experiencia. Construye la plataforma Servelec E-stock y el hub Urban Culture (ParkSports + Corridor) como miembro de la junta de LifeGroup. Proyectos propios: ImmoGen y sitios de clientes.',
    experience: [
      {
        period: '2025 — actualidad',
        role: 'Desarrollador y miembro de junta',
        org: 'LifeGroup · Servelec · Urban Culture',
        location: 'Bélgica',
        bullets: [
          'Desarrollo y mantenimiento de la plataforma Servelec E-stock (ciclo de producto, RMA, almacén, TIP/Outlook).',
          'Combina ingeniería con responsabilidades de junta en LifeGroup.',
          'Automatización, integraciones y entrega pragmática en equipo pequeño.',
        ],
      },
      {
        period: '2021 — 2025',
        role: 'Desarrollo web (formación + proyectos)',
        org: 'Formación profesional y freelance',
        location: 'Bélgica',
        bullets: [
          'Programa de 4 años en desarrollo web — diploma obtenido.',
          'Portfolio de proyectos personales y de clientes (React, TypeScript, Supabase).',
          'Entrega full-stack: APIs, auth, despliegues en Vercel.',
        ],
      },
    ],
    projects: sharedProjects,
    skills: [
      { group: 'Frontend', items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Three.js'] },
      { group: 'Backend', items: ['Python', 'FastAPI', 'Node.js', 'REST APIs', 'Supabase'] },
      { group: 'Datos y herramientas', items: ['PostgreSQL', 'Git', 'Vercel', 'Cursor', 'Linux'] },
      { group: 'Enfoque', items: ['Prototipos de producto', 'Desarrollo asistido por IA', 'Tech sostenible', 'i18n'] },
    ],
    education: [
      { period: '2021 — 2025', title: 'Desarrollo web', org: 'Diploma — Bélgica' },
      { period: '2019 — 2020', title: 'Ciencias vegetales técnicas', org: 'Diploma — Bélgica' },
    ],
    languages: ['Neerlandés (nativo)', 'Inglés (fluido)', 'Francés (trabajo)', 'Español (básico)'],
  },
};

export function getCvContent(locale: string): CvContent {
  const key = (locale.startsWith('nl') ? 'nl' : locale.startsWith('es') ? 'es' : 'en') as CvLocale;
  return contentByLocale[key];
}

export function getCvContact() {
  return CONTACT;
}

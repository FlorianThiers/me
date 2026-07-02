export interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  github: string;
  /** Omit for private / internal platforms */
  live?: string;
  category: string;
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 9,
    title: 'Urban Culture Gent',
    description:
      'Umbrella brand site for urban sports and culture in Ghent — unifying ParkSports and Corridor under one Next.js hub with room to grow into a full redesign.',
    image: '/projects/urban-culture.png',
    technologies: ['Next.js', 'TypeScript', 'React 19', 'Tailwind CSS'],
    github: 'https://github.com/LifeGroup-CodeLux/UrbanCulture',
    live: 'https://urban-culture-ghent.vercel.app/',
    category: 'Full-Stack',
  },
  {
    id: 8,
    title: 'Servelec Platform',
    description:
      'B2B operations platform for inventory, warehouse workflows, service requests and multi-brand admin — built with modern full-stack tooling.',
    image: '/projects/servelec.png',
    technologies: ['Next.js', 'TypeScript', 'Supabase', 'shadcn/ui', 'Vitest'],
    github: 'https://github.com/FlorianThiers',
    category: 'Enterprise / Full-Stack',
  },
  {
    id: 7,
    title: 'Corridor - Urban Sport Hub',
    description:
      'One-page website for Corridor, the Urban Sport Hub of Gentbrugge. Features modern design showcasing sports facilities, community activities, and events under the E17 viaduct.',
    image: '/projects/corridor.png',
    technologies: ['HTML5', 'Tailwind CSS', 'GSAP', 'Responsive Design'],
    github: 'https://github.com/FlorianThiers/corridor',
    live: 'https://corridor-blond.vercel.app/',
    category: 'Web Development',
  },
  {
    id: 6,
    title: 'Portfolio Website',
    description:
      'Interactive portfolio website with animated Mandelbrot background, built with React, TypeScript, and Three.js. Features dynamic color-changing fractals and smooth animations.',
    image: '/projects/portfolio.png',
    technologies: ['React', 'TypeScript', 'Three.js', 'Tailwind CSS'],
    github: 'https://github.com/FlorianThiers',
    live: 'https://florian-tau.vercel.app/',
    category: 'Portfolio',
  },
  {
    id: 5,
    title: 'ParkSports Community',
    description:
      'Community platform for slackline and parksports enthusiasts. Features spot discovery, events, community interaction, and learning resources.',
    image: '/projects/parksports.png',
    technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    github: 'https://github.com/FlorianThiers/ParkSports',
    live: 'https://www.parksports.space/',
    category: 'Full-Stack',
  },
  {
    id: 4,
    title: 'Vijverstofzuigers Website',
    description:
      'Professional website for pool cleaning services with modern React frontend and Supabase backend. Features dynamic content management, contact forms, and responsive design.',
    image: '/projects/vijverstofzuigers.png',
    technologies: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    github: 'https://github.com/FlorianThiers',
    live: 'https://vijverstofzuiger.vercel.app/',
    category: 'Full-Stack',
  },
  {
    id: 3,
    title: 'ImmoGen',
    description:
      'AI-driven real estate platform combining machine learning with property management. Advanced property analysis and management system.',
    image: '/projects/immogen.png',
    technologies: ['Python', 'FastAPI', 'React', 'Machine Learning'],
    github: 'https://github.com/FlorianThiers',
    live: 'https://immo-gen-olive.vercel.app/',
    category: 'AI/ML',
  },
  {
    id: 2,
    title: 'Jump-Thrs Game',
    description:
      'Interactive web-based game with engaging gameplay mechanics. My first game development project showcasing creative programming and user experience design.',
    image: '/projects/jump.png',
    technologies: ['JavaScript', 'Game Development', 'HTML5', 'CSS3'],
    github: 'https://github.com/FlorianThiers/jump-thrs',
    live: 'https://jump-thrs.vercel.app/',
    category: 'Game Development',
  },
  {
    id: 1,
    title: '3D Room Experience',
    description:
      'Immersive 3D room experience with interactive storytelling elements. Features atmospheric design, animations, and narrative progression through a mysterious room.',
    image: '/projects/room.png',
    technologies: ['Three.js', 'JavaScript', 'WebGL', '3D Modeling'],
    github: 'https://github.com/FlorianThiers',
    live: 'https://3-d-room-six.vercel.app/',
    category: 'Web Development',
  },
];

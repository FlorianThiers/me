import { lazy } from 'react';

export const HomePage = lazy(() => import('./HomePage').then((m) => ({ default: m.HomePage })));
export const PortfolioPage = lazy(() => import('./PortfolioPage').then((m) => ({ default: m.PortfolioPage })));
export const SkillsPage = lazy(() => import('./SkillsPage').then((m) => ({ default: m.SkillsPage })));
export const JourneyPage = lazy(() => import('./JourneyPage').then((m) => ({ default: m.JourneyPage })));
export const GoalsPage = lazy(() => import('./GoalsPage').then((m) => ({ default: m.GoalsPage })));
export const InterestsPage = lazy(() => import('./InterestsPage').then((m) => ({ default: m.InterestsPage })));
export const MindComputerPage = lazy(() => import('./MindComputerPage').then((m) => ({ default: m.MindComputerPage })));
export const CarlJungPage = lazy(() => import('./philosophers/CarlJungPage').then((m) => ({ default: m.CarlJungPage })));
export const WilliamJamesPage = lazy(() =>
  import('./philosophers/WilliamJamesPage').then((m) => ({ default: m.WilliamJamesPage }))
);
export const SigmundFreudPage = lazy(() =>
  import('./philosophers/SigmundFreudPage').then((m) => ({ default: m.SigmundFreudPage }))
);
export const AlanTuringPage = lazy(() =>
  import('./philosophers/AlanTuringPage').then((m) => ({ default: m.AlanTuringPage }))
);
export const ItzhakBentovPage = lazy(() =>
  import('./philosophers/ItzhakBentovPage').then((m) => ({ default: m.ItzhakBentovPage }))
);
export const SubstancesPage = lazy(() => import('./topics/SubstancesPage').then((m) => ({ default: m.SubstancesPage })));
export const MeditationPage = lazy(() => import('./topics/MeditationPage').then((m) => ({ default: m.MeditationPage })));
export const QuantumPage = lazy(() => import('./topics/QuantumPage').then((m) => ({ default: m.QuantumPage })));
export const AIConsciousnessPage = lazy(() =>
  import('./topics/AIConsciousnessPage').then((m) => ({ default: m.AIConsciousnessPage }))
);
export const NeuralNetworksPage = lazy(() =>
  import('./topics/NeuralNetworksPage').then((m) => ({ default: m.NeuralNetworksPage }))
);
export const ConsciousnessExpansionPage = lazy(() =>
  import('./topics/ConsciousnessExpansionPage').then((m) => ({ default: m.ConsciousnessExpansionPage }))
);
export const MusicPage = lazy(() => import('./MusicPage').then((m) => ({ default: m.MusicPage })));
export const SportsPage = lazy(() => import('./SportsPage').then((m) => ({ default: m.SportsPage })));
export const DapoFlowStarPage = lazy(() =>
  import('./sports/DapoFlowStarPage').then((m) => ({ default: m.DapoFlowStarPage }))
);
export const DancingPage = lazy(() => import('./sports/DancingPage').then((m) => ({ default: m.DancingPage })));
export const CultivationPage = lazy(() => import('./CultivationPage').then((m) => ({ default: m.CultivationPage })));
export const CookingPage = lazy(() => import('./CookingPage').then((m) => ({ default: m.CookingPage })));
export const GardenDesignPage = lazy(() => import('./GardenDesignPage').then((m) => ({ default: m.GardenDesignPage })));
export const GardenCarePage = lazy(() => import('./GardenCarePage').then((m) => ({ default: m.GardenCarePage })));
export const BeleggenPage = lazy(() => import('./BeleggenPage').then((m) => ({ default: m.BeleggenPage })));
export const MoltbookPage = lazy(() => import('./MoltbookPage').then((m) => ({ default: m.MoltbookPage })));
export const MandelbrotPage = lazy(() => import('./MandelbrotPage').then((m) => ({ default: m.MandelbrotPage })));
export const SquaredMosaicPage = lazy(() =>
  import('./SquaredMosaicPage').then((m) => ({ default: m.SquaredMosaicPage }))
);
export const CareLayersPage = lazy(() =>
  import('./CareLayersPage').then((m) => ({ default: m.CareLayersPage }))
);
export const JuliaPage = lazy(() => import('./JuliaPage').then((m) => ({ default: m.JuliaPage })));
export const OrbitRouterPage = lazy(() =>
  import('./OrbitRouterPage').then((m) => ({ default: m.OrbitRouterPage }))
);
export const JuliaUsagePage = lazy(() => import('./JuliaUsagePage').then((m) => ({ default: m.JuliaUsagePage })));
export const StockPage = lazy(() => import('./StockPage').then((m) => ({ default: m.StockPage })));
export const LifeRhythmPage = lazy(() => import('./LifeRhythmPage').then((m) => ({ default: m.LifeRhythmPage })));
export const CvPage = lazy(() => import('./CvPage').then((m) => ({ default: m.CvPage })));

export const OrbitLayout = lazy(() =>
  import('../components/orbit/OrbitLayout').then((m) => ({ default: m.OrbitLayout }))
);

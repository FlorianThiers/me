import { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import { Navigation } from './components/Navigation';
import {
  HomePage,
  LinksPage,
  PortfolioPage,
  SkillsPage,
  JourneyPage,
  GoalsPage,
  InterestsPage,
  MindComputerPage,
  CarlJungPage,
  WilliamJamesPage,
  SigmundFreudPage,
  AlanTuringPage,
  ItzhakBentovPage,
  SubstancesPage,
  MeditationPage,
  QuantumPage,
  AIConsciousnessPage,
  NeuralNetworksPage,
  ConsciousnessExpansionPage,
  MusicPage,
  SportsPage,
  DapoFlowStarPage,
  DancingPage,
  CultivationPage,
  CookingPage,
  GardenDesignPage,
  GardenCarePage,
  BeleggenPage,
  MoltbookPage,
  MandelbrotPage,
  SquaredMosaicPage,
  CareLayersPage,
  JuliaPage,
  JuliaUsagePage,
  StockPage,
  LifeRhythmPage,
  CvPage,
  OrbitLayout,
  OrbitRouterPage,
} from './pages/lazyPages';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollToTopButton } from './components/ScrollToTopButton';

const PageFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center text-white/35 text-sm" aria-hidden="true">
    …
  </div>
);

function AppShell() {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const studio = pathname === '/music';

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  };

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  return (
    <div className="App relative">
      <Navigation
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
      />

      <main className="relative z-10">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/links" element={<LinksPage />} />
            <Route path="/julia" element={<JuliaPage />} />
            <Route path="/orbit" element={<OrbitRouterPage />} />
            <Route path="/music" element={<MusicPage />} />

            <Route element={<OrbitLayout />}>
              <Route path="/cv" element={<CvPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/journey" element={<JourneyPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/mandelbrot" element={<MandelbrotPage />} />
              <Route path="/squared-mosaic" element={<SquaredMosaicPage />} />
              <Route path="/care-layers" element={<CareLayersPage />} />
              <Route path="/julia/usage" element={<JuliaUsagePage />} />
              <Route path="/life-rhythm" element={<LifeRhythmPage />} />
              <Route path="/interests" element={<InterestsPage />} />
              <Route path="/mind-computer" element={<MindComputerPage />} />
              <Route path="/philosopher/carl-jung" element={<CarlJungPage />} />
              <Route path="/philosopher/william-james" element={<WilliamJamesPage />} />
              <Route path="/philosopher/sigmund-freud" element={<SigmundFreudPage />} />
              <Route path="/philosopher/alan-turing" element={<AlanTuringPage />} />
              <Route path="/philosopher/itzhak-bentov" element={<ItzhakBentovPage />} />
              <Route path="/topics/substances" element={<SubstancesPage />} />
              <Route path="/topics/meditation" element={<MeditationPage />} />
              <Route path="/topics/quantum" element={<QuantumPage />} />
              <Route path="/topics/ai-consciousness" element={<AIConsciousnessPage />} />
              <Route path="/topics/neural-networks" element={<NeuralNetworksPage />} />
              <Route path="/topics/consciousness-expansion" element={<ConsciousnessExpansionPage />} />
              <Route path="/sports" element={<SportsPage />} />
              <Route path="/sports/dapo-flow-star" element={<DapoFlowStarPage />} />
              <Route path="/sports/dancing" element={<DancingPage />} />
              <Route path="/cultivation" element={<CultivationPage />} />
              <Route path="/cooking" element={<CookingPage />} />
              <Route path="/stock" element={<StockPage />} />
              <Route path="/garden-designer" element={<GardenDesignPage />} />
              <Route path="/garden-care" element={<GardenCarePage />} />
              <Route path="/beleggen" element={<BeleggenPage />} />
              <Route path="/moltbook" element={<MoltbookPage />} />
            </Route>
          </Routes>
        </Suspense>
      </main>

      {!studio && <Footer />}
      {!studio && <ScrollToTopButton />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppShell />
    </Router>
  );
}

export default App;

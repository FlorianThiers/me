import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { SkillsPage } from './pages/SkillsPage';
import { JourneyPage } from './pages/JourneyPage';
import { GoalsPage } from './pages/GoalsPage';
import { InterestsPage } from './pages/InterestsPage';
import { MindComputerPage } from './pages/MindComputerPage';
import { CarlJungPage } from './pages/philosophers/CarlJungPage';
import { WilliamJamesPage } from './pages/philosophers/WilliamJamesPage';
import { SigmundFreudPage } from './pages/philosophers/SigmundFreudPage';
import { AlanTuringPage } from './pages/philosophers/AlanTuringPage';
import { ItzhakBentovPage } from './pages/philosophers/ItzhakBentovPage';
import { SubstancesPage } from './pages/topics/SubstancesPage';
import { MeditationPage } from './pages/topics/MeditationPage';
import { QuantumPage } from './pages/topics/QuantumPage';
import { AIConsciousnessPage } from './pages/topics/AIConsciousnessPage';
import { NeuralNetworksPage } from './pages/topics/NeuralNetworksPage';
import { ConsciousnessExpansionPage } from './pages/topics/ConsciousnessExpansionPage';
import { MusicPage } from './pages/MusicPage';
import { SportsPage } from './pages/SportsPage';
import { DapoFlowStarPage } from './pages/sports/DapoFlowStarPage';
import { DancingPage } from './pages/sports/DancingPage';
import { CultivationPage } from './pages/CultivationPage';
import { CookingPage } from './pages/CookingPage';
import { GardenDesignPage } from './pages/GardenDesignPage';
import { BeleggenPage } from './pages/BeleggenPage';
import { MoltbookPage } from './pages/MoltbookPage';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollToTopButton } from './components/ScrollToTopButton';

function App() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');



  // Taal wijzigen
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  };

  // Initialiseer taal bij component mount
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);



  return (
    <Router>
      <ScrollToTop />
      <div className="App relative">
        {/* Navigation */}
        <Navigation 
          onLanguageChange={handleLanguageChange}
          currentLanguage={currentLanguage}
        />

        {/* Main Content */}
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/journey" element={<JourneyPage />} />
            <Route path="/goals" element={<GoalsPage />} />
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
            <Route path="/music" element={<MusicPage />} />
            <Route path="/sports" element={<SportsPage />} />
            <Route path="/sports/dapo-flow-star" element={<DapoFlowStarPage />} />
            <Route path="/sports/dancing" element={<DancingPage />} />
            <Route path="/cultivation" element={<CultivationPage />} />
            <Route path="/cooking" element={<CookingPage />} />
            <Route path="/garden-designer" element={<GardenDesignPage />} />
            <Route path="/beleggen" element={<BeleggenPage />} />
            <Route path="/moltbook" element={<MoltbookPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
        
        {/* Scroll to Top Button */}
        <ScrollToTopButton />
      </div>
    </Router>
  );
}

export default App;

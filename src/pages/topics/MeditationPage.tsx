import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, Cpu, Lightbulb, BookOpen, Users, Star, Heart, Eye, Music, TreePine, Circle, Target, Waves, Moon, Sun, Zap } from 'lucide-react';

export const MeditationPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('difficulty'); // 'difficulty', 'duration', 'name'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  const techniques = [
    {
      name: "Transcendente Meditatie",
      description: "Mantra-gebaseerde meditatie voor diepe ontspanning zonder focus op ademhaling of lichaam",
      computerEquivalent: "Deep sleep mode (herstel en reparatie)",
      benefits: ["Diepe ontspanning", "Creativiteit boost", "Betere slaap", "Lange termijn effecten"],
      difficulty: "Beginner",
      difficultyLevel: 1,
      duration: "15 minuten",
      durationMinutes: 15,
      research: "Maharishi Mahesh Yogi (1955) - trademarked techniek",
      icon: <Circle className="w-8 h-8" />,
      category: "mantra",
      details: "Je herhaalt 15 minuten lang een mantra in je hoofd met ogen dicht. Zeer laagdrempelig en geschikt voor mensen die 'niet kunnen mediteren'."
    },
    {
      name: "Mindfulness Meditatie",
      description: "Focus op het huidige moment en vertragen van gedachtenstroom",
      computerEquivalent: "CPU optimalisatie (betere taakverdeling)",
      benefits: ["Verhoogde focus", "Stress reductie", "Betere emotie controle", "Neuroplasticiteit"],
      difficulty: "Beginner",
      difficultyLevel: 1,
      duration: "5-20 minuten",
      durationMinutes: 10,
      research: "Jon Kabat-Zinn's MBSR programma - wetenschappelijk onderbouwd",
      icon: <Brain className="w-8 h-8" />,
      category: "mindfulness",
      details: "Leer bewuster te worden van je zintuigen en gedachten zonder oordeel. Kan tijdens dagelijkse activiteiten zoals afwas of autorijden."
    },
    {
      name: "Mijn Dagelijkse Meditatie",
      description: "Hybride techniek: Mindfulness + Zen + Vipassana - mijn persoonlijke combinatie!",
      computerEquivalent: "Hybrid system optimization (gecombineerde systeemoptimalisatie)",
      benefits: ["Lichaamscontrole", "Geestelijke rust", "Diep inzicht", "Discipline", "Flexibiliteit", "Persoonlijke groei"],
      difficulty: "Gemiddeld",
      difficultyLevel: 2,
      duration: "10-60 minuten",
      durationMinutes: 10,
      research: "Combinatie van Jon Kabat-Zinn (Mindfulness), Zen traditie (houding), Vipassana (observatie)",
      icon: <Brain className="w-8 h-8" />,
      category: "mindfulness",
      details: "Mijn dagelijkse praktijk: 10 minuten in kleermakerzit, ogen dicht, gedachten en gevoelens observeren zonder te reageren. Perfect voor betere controle over lichaam en geest. Kan overal, zo comfortabel als je wilt - uitdaging bepaal je zelf!",
      personalExperience: true
    },
    {
      name: "Vipassana Meditatie",
      description: "Oudste meditatievorm gericht op inzicht door observatie van gedachten en emoties",
      computerEquivalent: "Debug mode (diepgaande systeemanalyse)",
      benefits: ["Diep inzicht", "Emotionele controle", "Discipline", "Zelfkennis"],
      difficulty: "Gevorderd",
      difficultyLevel: 3,
      duration: "30+ minuten",
      durationMinutes: 30,
      research: "Buddhistische traditie - 2500 jaar oud",
      icon: <Eye className="w-8 h-8" />,
      category: "insight",
      details: "Vraagt discipline en hard werk. Je observeert gedachten en emoties zonder ze te veroordelen, soms pijn negerend om focus te behouden."
    },
    {
      name: "Begeleide Meditatie",
      description: "Meditatie met audio- of videobegeleiding voor structuur en focus",
      computerEquivalent: "Tutorial mode (gestructureerde learning)",
      benefits: ["Gemakkelijk te volgen", "Structuur", "Verschillende thema's", "Toegankelijk"],
      difficulty: "Beginner",
      difficultyLevel: 1,
      duration: "10-45 minuten",
      durationMinutes: 20,
      research: "Moderne toepassing van traditionele technieken",
      icon: <Users className="w-8 h-8" />,
      category: "guided",
      details: "Perfect voor beginners. Begeleider helpt je door de meditatie heen met instructies en visualisaties."
    },
    {
      name: "Loving-Kindness Meditatie (Metta)",
      description: "Cultiveer compassie en liefde voor jezelf en anderen",
      computerEquivalent: "Firewall update (betere sociale verbindingen)",
      benefits: ["Meer empathie", "Betere relaties", "Emotionele stabiliteit", "Sociale vaardigheden"],
      difficulty: "Beginner",
      difficultyLevel: 1,
      duration: "15-30 minuten",
      durationMinutes: 20,
      research: "Buddhistische traditie - moderne psychologische toepassingen",
      icon: <Heart className="w-8 h-8" />,
      category: "compassion",
      details: "Je stuurt liefdevolle gedachten naar jezelf, dierbaren, neutrale personen en zelfs moeilijke mensen in je leven."
    },
    {
      name: "Body Scan Meditatie",
      description: "Systematisch scannen van het lichaam voor bewustwording en ontspanning",
      computerEquivalent: "System diagnostic (volledige systeemcheck)",
      benefits: ["Lichaamsbewustzijn", "Spanning loslaten", "Betere slaap", "Stress reductie"],
      difficulty: "Beginner",
      difficultyLevel: 1,
      duration: "20-45 minuten",
      durationMinutes: 30,
      research: "Jon Kabat-Zinn - onderdeel van MBSR programma",
      icon: <Target className="w-8 h-8" />,
      category: "body",
      details: "Je richt je aandacht systematisch op verschillende lichaamsdelen, van tenen tot kruin, om spanning te identificeren en los te laten."
    },
    {
      name: "Anapanasati",
      description: "Focus op de ademhaling als anker voor aandacht en rust",
      computerEquivalent: "Power management (energie optimalisatie)",
      benefits: ["Kalmeren van geest", "Betere focus", "Stress reductie", "Energie balans"],
      difficulty: "Beginner",
      difficultyLevel: 1,
      duration: "5-20 minuten",
      durationMinutes: 10,
      research: "Oude tradities - moderne wetenschappelijke onderbouwing",
      icon: <Waves className="w-8 h-8" />,
      category: "breathing",
      details: "Eenvoudig maar krachtig. Je volgt je natuurlijke ademhaling of gebruikt specifieke ademhalingstechnieken."
    },
    {
      name: "Samatha Meditatie",
      description: "Concentratie meditatie voor mentale kalmte en stabiliteit",
      computerEquivalent: "Single-threaded processing (geconcentreerde taakuitvoering)",
      benefits: ["Mentale kalmte", "Concentratie", "Emotionele stabiliteit", "Innerlijke rust"],
      difficulty: "Gemiddeld",
      difficultyLevel: 2,
      duration: "15-45 minuten",
      durationMinutes: 30,
      research: "Boeddhistische traditie - concentratie training",
      icon: <Target className="w-8 h-8" />,
      category: "concentration",
      details: "Je richt je aandacht op één object (ademhaling, kaars, mantra) om de geest te kalmeren en concentratie te ontwikkelen. Basis voor andere meditatievormen."
    },
    {
      name: "Pain Body Meditatie (Eckhart Tolle)",
      description: "Observeren en loslaten van opgeslagen emotionele pijn en trauma",
      computerEquivalent: "Memory cleanup (opgeslagen data verwijderen)",
      benefits: ["Emotionele healing", "Trauma verwerking", "Innerlijke vrijheid", "Bewustzijnsverruiming"],
      difficulty: "Gevorderd",
      difficultyLevel: 3,
      duration: "20-60 minuten",
      durationMinutes: 40,
      research: "Eckhart Tolle - 'The Power of Now' en 'A New Earth'",
      icon: <Heart className="w-8 h-8" />,
      category: "healing",
      details: "Je observeert de 'pain body' - opgeslagen emotionele pijn - zonder erin mee te gaan. Door bewustzijn en acceptatie transformeer je oude pijn in innerlijke vrijheid en vrede."
    },
    {
      name: "Yogi Meditating",
      description: "Traditionele yogische meditatie met focus op spirituele ontwikkeling en zelfrealisatie",
      computerEquivalent: "Spiritual OS (spiritueel besturingssysteem)",
      benefits: ["Spirituele groei", "Zelfrealisatie", "Innerlijke wijsheid", "Verbinding met hoger bewustzijn"],
      difficulty: "Gevorderd",
      difficultyLevel: 3,
      duration: "30-90 minuten",
      durationMinutes: 60,
      research: "Yogische traditie - Patanjali's Yoga Sutras",
      icon: <Sun className="w-8 h-8" />,
      category: "spiritual",
      details: "Diepe spirituele meditatie gericht op zelfrealisatie en vereniging met het hogere bewustzijn. Combineert ademhaling, mantra's en spirituele visualisaties voor transcendente ervaringen."
    },
    {
      name: "Nada Yoga",
      description: "Sound meditation - meditatie op geluiden en innerlijke klanken",
      computerEquivalent: "Audio processing (geluidsverwerking)",
      benefits: ["Diepe ontspanning", "Innerlijke rust", "Geluidsbewustzijn", "Spirituele verbinding"],
      difficulty: "Gemiddeld",
      difficultyLevel: 2,
      duration: "15-45 minuten",
      durationMinutes: 30,
      research: "Yogische traditie - geluid als spiritueel medium",
      icon: <Music className="w-8 h-8" />,
      category: "sound",
      details: "Meditatie op externe geluiden (Tibetaanse zangschalen, muziek) en innerlijke klanken. Doel is om één te worden met het universele geluid 'Om' (Para Nada)."
    },
    {
      name: "Trataka (Still Gazing)",
      description: "Candle gazing meditation voor concentratie en innerlijke stilte",
      computerEquivalent: "Visual focus optimization (visuele focus optimalisatie)",
      benefits: ["Concentratie", "Innerlijke stilte", "Visuele focus", "Psychische krachten"],
      difficulty: "Gemiddeld",
      difficultyLevel: 2,
      duration: "10-30 minuten",
      durationMinutes: 20,
      research: "Yogische traditie - Journal of Traditional and Complementary Medicine",
      icon: <Eye className="w-8 h-8" />,
      category: "concentration",
      details: "Staren naar een kaarsvlam, dan de mentale afbeelding visualiseren. Ontwikkelt concentratie en opent de geest voor psychische krachten."
    },
    {
      name: "Bhakti Yoga",
      description: "Devotional meditation - meditatie op een godheid voor eenheid",
      computerEquivalent: "Devotional protocol (devotioneel protocol)",
      benefits: ["Spirituele verbinding", "Devotie", "Emotionele zuivering", "Eenheid met het goddelijke"],
      difficulty: "Gemiddeld",
      difficultyLevel: 2,
      duration: "20-60 minuten",
      durationMinutes: 40,
      research: "Bhagavad Gita - één van de drie hoofdmeditaties",
      icon: <Heart className="w-8 h-8" />,
      category: "spiritual",
      details: "Meditatie op een godheid of spiritueel figuur om eenheid te bereiken. Een van de drie hoofdmeditaties uit de Bhagavad Gita."
    },
    {
      name: "Dhyana Yoga (Jnana)",
      description: "Knowledge meditation - diepe contemplatie voor spirituele wijsheid",
      computerEquivalent: "Deep learning algorithm (diep leeralgoritme)",
      benefits: ["Spirituele wijsheid", "Zelfkennis", "Bewustzijnsverruiming", "Filosofisch inzicht"],
      difficulty: "Gevorderd",
      difficultyLevel: 3,
      duration: "30-90 minuten",
      durationMinutes: 60,
      research: "Upanishads - oudste yogische meditatie",
      icon: <Brain className="w-8 h-8" />,
      category: "spiritual",
      details: "Diepe contemplatie en meditatie voor spirituele kennis. Oudste yogische meditatie uit de Upanishads, gericht op het overbruggen van de kloof tussen bewustzijn en realiteit."
    },
    {
      name: "Kundalini Yoga",
      description: "Energy awakening meditation - activering van kundalini energie",
      computerEquivalent: "Energy system activation (energiesysteem activering)",
      benefits: ["Energie activering", "Spirituele kracht", "Transformatie", "Verhoogd bewustzijn"],
      difficulty: "Gevorderd",
      difficultyLevel: 3,
      duration: "20-60 minuten",
      durationMinutes: 40,
      research: "Yogi Bhajan - kundalini energie activering",
      icon: <Zap className="w-8 h-8" />,
      category: "energy",
      details: "Meditatie om de slapende kundalini energie aan de basis van de ruggengraat te wekken. Vertegenwoordigt de goddelijke vrouwelijke energie van de godin."
    },
    {
      name: "Kriya Yoga",
      description: "Advanced pranayama meditation - geavanceerde ademhalingstechnieken",
      computerEquivalent: "Advanced breathing protocol (geavanceerd ademhalingsprotocol)",
      benefits: ["Spirituele ontwikkeling", "Energie controle", "Pranayama beheersing", "Transcendentie"],
      difficulty: "Gevorderd",
      difficultyLevel: 3,
      duration: "30-90 minuten",
      durationMinutes: 60,
      research: "Paramahamsa Yogananda - kriya yoga technieken",
      icon: <Waves className="w-8 h-8" />,
      category: "breathing",
      details: "Geavanceerde combinatie van pranayama, mantra en mudra praktijken. Gericht op spirituele ontwikkeling door het richten van levensenergie naar de zes centra van de ruggengraat."
    },
    {
      name: "Third Eye (Ajna) Meditatie",
      description: "Third eye activation - activering van het derde oog voor verhoogde perceptie",
      computerEquivalent: "Enhanced perception module (verbeterde perceptie module)",
      benefits: ["Verhoogde perceptie", "Intuïtie", "Psychische krachten", "Spiritueel inzicht"],
      difficulty: "Gevorderd",
      difficultyLevel: 3,
      duration: "20-60 minuten",
      durationMinutes: 40,
      research: "Yogische traditie - Shambhavi Mudra techniek",
      icon: <Eye className="w-8 h-8" />,
      category: "spiritual",
      details: "Meditatie op het derde oog (Ajna chakra) met Shambhavi Mudra (wenkbrauw staren). Ontwikkelt vijf siddhis: tijdskennis, dualiteit tolerantie, gedachtenlezen, elementen controle en onoverwinnelijkheid."
    },
    {
      name: "Pratyahara",
      description: "Sense withdrawal - terugtrekking van de zintuigen voor mentale bescherming",
      computerEquivalent: "Sensory firewall (zintuiglijke firewall)",
      benefits: ["Mentale bescherming", "Zintuiglijke controle", "Innerlijke rust", "Focus verbetering"],
      difficulty: "Gemiddeld",
      difficultyLevel: 2,
      duration: "15-45 minuten",
      durationMinutes: 30,
      research: "Patanjali - terugtrekking van de zintuigen",
      icon: <Target className="w-8 h-8" />,
      category: "concentration",
      details: "Terugtrekking van externe stimuli om de geest te beschermen. Volgens Patanjali begint yogische meditatie met Pratyahara, die de geest klaarmaakt voor meditatieve praktijken."
    },
    {
      name: "Samyama",
      description: "Deepest yogic meditation - de diepste en meest transcendente yogische meditatie",
      computerEquivalent: "Transcendent processing (transcendente verwerking)",
      benefits: ["Transcendentie", "Ultieme eenheid", "Spirituele verlichting", "Goddelijke verbinding"],
      difficulty: "Gevorderd",
      difficultyLevel: 3,
      duration: "60+ minuten",
      durationMinutes: 90,
      research: "Patanjali - hoogste vorm van yogische meditatie",
      icon: <Sun className="w-8 h-8" />,
      category: "spiritual",
      details: "De diepste en meest transcendente vorm van yogische meditatie. Combineert concentratie (Dharana), meditatie (Dhyana) en absorptie (Samadhi) voor ultieme spirituele verlichting."
    },
    {
      name: "Visualisatie Meditatie",
      description: "Gebruik van mentale beelden voor ontspanning en doelstelling",
      computerEquivalent: "Virtual reality mode (immersive experience)",
      benefits: ["Creativiteit", "Doelstelling", "Ontspanning", "Mentale training"],
      difficulty: "Gemiddeld",
      difficultyLevel: 2,
      duration: "10-30 minuten",
      durationMinutes: 20,
      research: "Sportpsychologie en traditionele healing praktijken",
      icon: <Eye className="w-8 h-8" />,
      category: "visualization",
      details: "Je creëert levendige mentale beelden van rustige plekken, doelen of gewenste uitkomsten."
    },
    {
      name: "Mantra Meditatie",
      description: "Herhaling van heilige woorden of geluiden voor focus en trance",
      computerEquivalent: "Background process (continue optimalisatie)",
      benefits: ["Diepe focus", "Spirituele verbinding", "Trance staat", "Mentale kracht"],
      difficulty: "Gemiddeld",
      difficultyLevel: 2,
      duration: "15-60 minuten",
      durationMinutes: 30,
      research: "Hindoeïstische en boeddhistische tradities",
      icon: <Music className="w-8 h-8" />,
      category: "mantra",
      details: "Herhaling van krachtige woorden of geluiden zoals 'Om' of persoonlijke mantras voor diepe meditatieve staat."
    },
    {
      name: "Chakra Meditatie",
      description: "Focus op energiecentra in het lichaam voor balans en healing",
      computerEquivalent: "Network optimization (energie flow optimalisatie)",
      benefits: ["Energie balans", "Emotionele healing", "Spirituele groei", "Lichaamsbewustzijn"],
      difficulty: "Gemiddeld",
      difficultyLevel: 2,
      duration: "20-45 minuten",
      durationMinutes: 30,
      research: "Yogische traditie - moderne energie healing",
      icon: <Circle className="w-8 h-8" />,
      category: "energy",
      details: "Je richt je op de 7 hoofdchakra's, van wortel tot kroon, om energieblokkades op te lossen en balans te creëren."
    },
    {
      name: "Loop Meditatie",
      description: "Meditatie tijdens langzaam, bewust wandelen",
      computerEquivalent: "Background processing (multitasking optimalisatie)",
      benefits: ["Beweging en meditatie", "Natuurverbinding", "Mindful wandelen", "Creativiteit"],
      difficulty: "Beginner",
      difficultyLevel: 1,
      duration: "15-60 minuten",
      durationMinutes: 30,
      research: "Boeddhistische traditie - moderne mindful walking",
      icon: <TreePine className="w-8 h-8" />,
      category: "movement",
      details: "Perfect voor buitenmensen. Je wandelt langzaam en bewust, waarbij elke stap een moment van aandacht is."
    },
    {
      name: "Yoga",
      description: "Meditatie door bewuste beweging en houdingen - mindful yoga practice",
      computerEquivalent: "Dynamic processing (dynamische verwerking)",
      benefits: ["Lichaamsbewustzijn", "Flexibiliteit", "Kracht", "Mind-body verbinding", "Stress reductie"],
      difficulty: "Beginner",
      difficultyLevel: 1,
      duration: "20-90 minuten",
      durationMinutes: 45,
      research: "Yogische traditie - Patanjali's acht ledematen van yoga",
      icon: <TreePine className="w-8 h-8" />,
      category: "movement",
      details: "Yoga beoefening met volledige aandacht voor elke beweging en houding. Combineert fysieke oefening met meditatieve bewustzijn voor een complete mind-body ervaring."
    },
    {
      name: "Yoga Nidra",
      description: "Geleide meditatie in liggende houding voor diepe ontspanning",
      computerEquivalent: "Hibernation mode (diep herstel)",
      benefits: ["Diepe ontspanning", "Betere slaap", "Stress reductie", "Emotionele healing"],
      difficulty: "Beginner",
      difficultyLevel: 1,
      duration: "20-60 minuten",
      durationMinutes: 40,
      research: "Yogische traditie - moderne slaapmeditatie",
      icon: <Moon className="w-8 h-8" />,
      category: "relaxation",
      details: "Liggende meditatie die je naar de drempel van slaap brengt voor diep herstel en ontspanning."
    },
    {
      name: "Zen Meditatie (Zazen)",
      description: "Zittende meditatie met focus op houding en ademhaling",
      computerEquivalent: "Core system optimization (fundamentele optimalisatie)",
      benefits: ["Discipline", "Mentale kracht", "Inzicht", "Spirituele groei"],
      difficulty: "Gevorderd",
      difficultyLevel: 3,
      duration: "20-60 minuten",
      durationMinutes: 40,
      research: "Zen boeddhisme - Japanse traditie",
      icon: <Sun className="w-8 h-8" />,
      category: "zen",
      details: "Strikt zittende meditatie met focus op juiste houding en natuurlijke ademhaling. Vereist discipline en doorzettingsvermogen."
    },
    {
      name: "Slaap Meditatie",
      description: "Meditatie specifiek ontworpen om in slaap te vallen",
      computerEquivalent: "Sleep mode activation (automatisch uitschakelen)",
      benefits: ["Betere slaap", "Insomnia behandeling", "Ontspanning", "Slaapkwaliteit"],
      difficulty: "Beginner",
      difficultyLevel: 1,
      duration: "10-30 minuten",
      durationMinutes: 20,
      research: "Moderne slaapwetenschap en traditionele technieken",
      icon: <Moon className="w-8 h-8" />,
      category: "sleep",
      details: "Speciale technieken en visualisaties die je helpen om sneller in slaap te vallen en beter te slapen."
    }
  ];

  const categories = [
    { id: 'all', name: 'Alle Soorten', icon: <Star className="w-4 h-4" /> },
    { id: 'mindfulness', name: 'Mindfulness', icon: <Brain className="w-4 h-4" /> },
    { id: 'mantra', name: 'Mantra', icon: <Music className="w-4 h-4" /> },
    { id: 'breathing', name: 'Ademhaling', icon: <Waves className="w-4 h-4" /> },
    { id: 'concentration', name: 'Concentratie', icon: <Target className="w-4 h-4" /> },
    { id: 'healing', name: 'Healing', icon: <Heart className="w-4 h-4" /> },
    { id: 'spiritual', name: 'Spiritueel', icon: <Sun className="w-4 h-4" /> },
    { id: 'sound', name: 'Geluid', icon: <Music className="w-4 h-4" /> },
    { id: 'energy', name: 'Energie', icon: <Zap className="w-4 h-4" /> },
    { id: 'movement', name: 'Beweging', icon: <TreePine className="w-4 h-4" /> },
    { id: 'guided', name: 'Begeleid', icon: <Users className="w-4 h-4" /> },
    { id: 'sleep', name: 'Slaap', icon: <Moon className="w-4 h-4" /> }
  ];

  const filteredTechniques = selectedCategory === 'all' 
    ? techniques 
    : techniques.filter(technique => technique.category === selectedCategory);

  const sortedTechniques = [...filteredTechniques].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'difficulty':
        aValue = a.difficultyLevel;
        bValue = b.difficultyLevel;
        break;
      case 'duration':
        aValue = a.durationMinutes;
        bValue = b.durationMinutes;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen pt-20 bg-dark-secondary relative overflow-hidden">
      {/* Decoratieve achtergrond elementen */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-5"
        aria-hidden="true"
        role="presentation"
      >
        <div className="absolute top-32 left-32 w-80 h-80 bg-neon-green rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-neon-purple rounded-full blur-3xl" />
      </div>

      <div className="container-custom px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 neon-text">
              Meditatie & CPU Training
            </h1>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
              Leer hoe meditatie je bewustzijn kan optimaliseren, net zoals je een computer kunt 
              optimaliseren voor betere prestaties. Ontdek verschillende technieken en hun effecten 
              op je mind-computer.
            </p>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              to="/mind-computer"
              className="inline-flex items-center space-x-2 text-neon-green hover:text-neon-blue transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Terug naar Mind as Computer</span>
            </Link>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Soorten Meditatie
            </h2>
            <p className="text-lg text-white/80 max-w-4xl mx-auto mb-8">
              Meditatie is als het optimaliseren van je computer - het verbetert prestaties, 
              vermindert crashes en maakt je systeem efficiënter. Elke techniek heeft unieke 
              voordelen voor verschillende aspecten van je bewustzijn. Gebaseerd op onderzoek van{' '}
              <a href="https://mindcelium.nl/soorten-meditatie/" target="_blank" rel="noopener noreferrer" className="text-neon-green hover:text-neon-blue transition-colors">
                Mindcelium
              </a>{' '}en{' '}
              <a href="https://www.thedailymeditation.com/12-yogic-meditation-techniques" target="_blank" rel="noopener noreferrer" className="text-neon-green hover:text-neon-blue transition-colors">
                The Daily Meditation
              </a>.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            {/* Alle Soorten - Centraal */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full border transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-neon-green/20 border-neon-green text-neon-green'
                    : 'bg-dark-bg/50 border-white/20 text-white/70 hover:border-neon-green/50 hover:text-neon-green'
                }`}
              >
                <Star className="w-5 h-5" />
                <span className="text-base font-medium">Alle Soorten</span>
              </button>
            </div>
            
            {/* Andere Categorieën */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.filter(category => category.id !== 'all').map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-neon-green/20 border-neon-green text-neon-green'
                      : 'bg-dark-bg/50 border-white/20 text-white/70 hover:border-neon-green/50 hover:text-neon-green'
                  }`}
                >
                  {category.icon}
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Sort Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <div className="flex items-center space-x-2">
              <span className="text-white/70 text-sm">Sorteer op:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-dark-bg/50 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:border-neon-green focus:outline-none"
              >
                <option value="difficulty">Moeilijkheid</option>
                <option value="duration">Tijdsduur</option>
                <option value="name">Naam</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-white/70 text-sm">Volgorde:</span>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center space-x-2 px-3 py-2 bg-dark-bg/50 border border-white/20 text-white rounded-lg hover:border-neon-green transition-all duration-300"
              >
                {sortOrder === 'asc' ? (
                  <>
                    <span className="text-sm">↑</span>
                    <span className="text-sm">Oplopend</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">↓</span>
                    <span className="text-sm">Aflopend</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Techniques Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTechniques.map((technique, index) => (
              <motion.div
                key={technique.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className={`bg-dark-secondary/50 backdrop-blur-sm border rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 group relative ${
                  technique.personalExperience 
                    ? 'border-neon-green/30 shadow-lg shadow-neon-green/10' 
                    : 'border-white/10'
                }`}
              >
                {/* Personal Experience Badge */}
                {technique.personalExperience && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Mijn Favoriet
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3 text-neon-green group-hover:scale-110 transition-transform duration-300">
                    {technique.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {technique.name}
                  </h3>
                  <p className="text-white/70 text-sm mb-4 leading-relaxed">
                    {technique.description}
                  </p>
                </div>

                {/* Computer Equivalent */}
                <div className="mb-4">
                  <h4 className="text-neon-blue font-semibold mb-2 flex items-center text-sm">
                    <Cpu className="w-4 h-4 mr-2" />
                    Computer Equivalent
                  </h4>
                  <p className="text-white/70 text-xs leading-relaxed">
                    {technique.computerEquivalent}
                  </p>
                </div>

                {/* Benefits */}
                <div className="mb-4">
                  <h4 className="text-neon-green font-semibold mb-2 flex items-center text-sm">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Voordelen
                  </h4>
                  <ul className="space-y-1">
                    {technique.benefits.slice(0, 3).map((benefit, idx) => (
                      <li key={idx} className="text-white/70 text-xs flex items-start space-x-2">
                        <span className="text-neon-green mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                    {technique.benefits.length > 3 && (
                      <li className="text-white/50 text-xs">
                        +{technique.benefits.length - 3} meer voordelen
                      </li>
                    )}
                  </ul>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Moeilijkheid:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      technique.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                      technique.difficulty === 'Gemiddeld' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {technique.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Duur:</span>
                    <span className="px-2 py-1 bg-dark-bg/50 rounded border border-white/20 text-xs">
                      {technique.duration}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10 mb-3">
                  <h4 className="text-neon-purple font-semibold mb-2 flex items-center text-sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Hoe werkt het?
                  </h4>
                  <p className="text-white/70 text-xs leading-relaxed">
                    {technique.details}
                  </p>
                </div>

                {/* Research */}
                <div className="bg-dark-bg/30 rounded-lg p-3 border border-white/10">
                  <h4 className="text-neon-purple font-semibold mb-2 flex items-center text-sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Onderzoek
                  </h4>
                  <p className="text-white/70 text-xs leading-relaxed">
                    {technique.research}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Personal Experience Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="bg-gradient-to-r from-neon-green/10 to-neon-blue/10 rounded-2xl p-8 border border-neon-green/30">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Mijn Persoonlijke Meditatie Praktijk
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-neon-green mb-4 flex items-center">
                  <Brain className="w-6 h-6 mr-2" />
                  Hybride Meditatie Praktijk
                </h3>
                <p className="text-white/80 leading-relaxed mb-4">
                  Ik doe dagelijks minimum 10 minuten meditatie in kleermakerzit.
                  Dit is meestal na een workout of training. Ik laat gedachten en gevoelens binnen sijpelen, observeer ze zonder te reageren.
                </p>
                <p className="text-white/80 leading-relaxed mb-4">
                  <strong>Mijn combinatie van technieken:</strong><br/>
                  • <span className="text-neon-green">Mindfulness</span> - focus op huidige moment<br/>
                  • <span className="text-neon-blue">Zen</span> - aandacht voor houding en ademhaling<br/>
                  • <span className="text-neon-purple">Vipassana</span> - diepe observatie van gedachten en emoties
                </p>
                <p className="text-white/80 leading-relaxed">
                  Dit geeft me betere controle over lichaam en geest. De uitdaging bepaal ik zelf - 
                  soms 10 minuten, soms tot een uur. Het kan overal: binnen, buiten, 
                  zo comfortabel als ik maar wil. Het traint mijn tijdsbesef en focus.
                  Het helpt ook om overweldigende gebeurtenissen te relativeren.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-neon-blue mb-4 flex items-center">
                  <Target className="w-6 h-6 mr-2" />
                  Waarom Deze Hybride Aanpak?
                </h3>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-start space-x-2">
                    <span className="text-neon-green mt-1">•</span>
                    <span><strong>Mindfulness</strong> - Flexibiliteit en toegankelijkheid</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-neon-blue mt-1">•</span>
                    <span><strong>Zen</strong> - Discipline en houding</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-neon-purple mt-1">•</span>
                    <span><strong>Vipassana</strong> - Diep inzicht en zelfkennis</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-neon-green mt-1">•</span>
                    <span>Geen speciale uitrusting nodig</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-neon-green mt-1">•</span>
                    <span>Directe impact op focus en rust</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-neon-green mt-1">•</span>
                    <span>Perfecte balans tussen uitdaging en comfort</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Veelgestelde Vragen over Meditatie
          </h2>
          <div className="space-y-6">
            <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold text-neon-green mb-3">Welke meditatie is het beste voor mij?</h3>
              <p className="text-white/70 leading-relaxed">
                Dat hangt volledig af van je intentie. Meditatie helpt je bij ontspannen, mindfulness training, 
                beweging of in slaap vallen. Begin bij het bepalen van een doel en kies daar een passende 
                meditatie bij. Probeer verschillende vormen uit - soms ontdek je tijdens bijzondere 
                meditatievormen onderdelen van jezelf die je nog niet kende.
              </p>
            </div>
            
            <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold text-neon-green mb-3">Kan je zelf leren mediteren?</h3>
              <p className="text-white/70 leading-relaxed">
                Helemaal zonder instructie mediteren is mogelijk, maar begeleide meditatie is vaak wel een 
                goede manier om te starten als je geen ervaring hebt. Je hebt geen instructeur nodig om je 
                te vertellen wat je moet doen, maar het helpt om te begrijpen wat een meditatieve staat is 
                en hoe je die bereikt.
              </p>
            </div>
            
            <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold text-neon-green mb-3">Kan je liggend mediteren?</h3>
              <p className="text-white/70 leading-relaxed">
                Liggende meditatie wordt vaak gebruikt bij slaapmeditatie of zeer ontspannende vormen van 
                meditatie, zoals Yoga Nidra. Mocht je geen goede rug hebben of kun je niet zo lang blijven 
                zitten in één houding dan kan je de meeste meditaties ook liggend doen.
              </p>
            </div>
            
            <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold text-neon-green mb-3">Hoe weet je of je goed mediteert?</h3>
              <p className="text-white/70 leading-relaxed">
                Mensen gebruiken meditatie om te ontspannen, gedachten te organiseren, nieuwe inzichten te 
                krijgen of het ego los te laten. Merk je na je meditatie dat je één van die dingen bereikt 
                hebt – en was dat ook je intentie? Dan zit je waarschijnlijk op het goede spoor.
              </p>
            </div>
            
            <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold text-neon-green mb-3">Hoe vaak mag je mediteren?</h3>
              <p className="text-white/70 leading-relaxed">
                Sommige mensen mediteren één of twee uur per dag. Er zijn zelfs mensen die het langer doen, 
                zoals monniken. Er zijn geen levensbedreigende risico's als je vaker of langer mediteert. 
                Sommige mensen merken wel dat ze zich emotioneel 'leger' voelen als ze vaak mediteren.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <p className="text-white/70 mb-6 text-lg">
            Geïnteresseerd in het leren van meditatie technieken of samenwerken aan 
            bewustzijnsoptimalisatie projecten?
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/#contact"
              className="inline-block bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-8 rounded-full hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300"
            >
              Laten we Bespreken
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

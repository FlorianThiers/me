import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Music, Heart, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DancingPage: React.FC = () => {
  const sections = [
    {
      icon: <Music className="w-8 h-8" />,
      title: 'Expressie door Beweging',
      description: 'Dans is voor mij een pure vorm van zelfexpressie. Het is een taal zonder woorden waar emoties, verhalen en energie worden gecommuniceerd door beweging en ritme.',
      photoPlaceholder: '📸 Dans expressie',
      color: 'from-rose-400 to-red-600'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Emotionele Verbinding',
      description: 'Door dans kan ik emoties uiten die moeilijk in woorden te vatten zijn. Het is een therapeutische uitlaatklep die me helpt om mezelf beter te begrijpen en te accepteren.',
      photoPlaceholder: '📸 Emotionele dans',
      color: 'from-pink-400 to-rose-600'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Sociale Dans & Freestyle',
      description: 'Ik geniet van zowel sociale dansvormen als freestyle sessies. Sociale dans verbindt mensen, terwijl freestyle me de vrijheid geeft om mijn eigen stijl te ontwikkelen.',
      photoPlaceholder: '📸 Sociale dans sessie',
      color: 'from-blue-400 to-cyan-600'
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Choreografie & Improvisatie',
      description: 'Ik werk graag met choreografieën maar hou ook van improvisatie. Het is een balans tussen structuur en spontaniteit die me uitdaagt om creatief te zijn.',
      photoPlaceholder: '📸 Choreografie werk',
      color: 'from-yellow-400 to-orange-600'
    }
  ];

  const danceStyles = [
    {
      title: 'Freestyle',
      description: 'Vrije, ongestructureerde dans waar ik mijn eigen stijl kan ontwikkelen en experimenteren met verschillende bewegingen en ritmes.'
    },
    {
      title: 'Hip Hop',
      description: 'Energieke dansstijl met strakke bewegingen, isolaties en ritmische patronen die me uitdagen om mijn coördinatie te verbeteren.'
    },
    {
      title: 'Contemporary',
      description: 'Moderne dansvorm die emotie en verhaal combineert met vloeiende, expressieve bewegingen en technische vaardigheden.'
    },
    {
      title: 'Social Dancing',
      description: 'Dansvormen zoals salsa, bachata en kizomba die me leren om te leiden en te volgen in een sociale context.'
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-dark-bg">
      <div className="container-custom px-4 py-8">
        
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center mb-8">
            <Link
              to="/sports"
              className="mr-4 p-2 rounded-full bg-dark-secondary/50 border border-white/10 hover:border-neon-green/50 transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Dancing
              </h1>
              <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
                Dans is mijn passie voor expressie, emotie en beweging. Het is een kunstvorm die me leert om 
                mezelf te uiten, te verbinden met anderen en te groeien als persoon door ritme en beweging.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-neon-green/50 transition-all duration-300 group"
              >
                {/* Photo Section */}
                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-white/10">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{section.photoPlaceholder}</div>
                    <p className="text-white/60 text-xs">Foto ruimte</p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-2 rounded-full bg-gradient-to-r ${section.color} mr-3 group-hover:scale-110 transition-transform duration-300`}>
                      {section.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {section.title}
                    </h3>
                  </div>
                  
                  <p className="text-white/70 leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dance Styles Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Dansstijlen & Technieken
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {danceStyles.map((style, index) => (
                <motion.div
                  key={style.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 hover:border-neon-green/50 transition-all duration-300"
                >
                  <h3 className="text-xl font-bold text-neon-green mb-3">
                    {style.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {style.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Music Connection Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Dans & Muziek
            </h2>
            <div className="bg-gradient-to-r from-rose-500/20 to-red-500/20 rounded-xl p-8 border border-rose-500/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Ritme & Emotie
                  </h3>
                  <p className="text-white/80 leading-relaxed mb-4">
                    Dans en muziek zijn onlosmakelijk verbonden. Muziek inspireert beweging, terwijl dans 
                    muziek tot leven brengt. Ik geniet ervan om verschillende genres te verkennen - van 
                    elektronische beats tot Latin ritmes en alles daartussenin.
                  </p>
                  <p className="text-white/80 leading-relaxed">
                    Elke muziekstijl heeft zijn eigen energie en karakter, wat me uitdaagt om verschillende 
                    dansstijlen te ontwikkelen en mijn bewegingsvocabulaire uit te breiden.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-6xl mb-4">🎵💃</div>
                  <p className="text-white/60 text-sm">Muziek & Dans connectie</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Journey Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Mijn Dansreis
            </h2>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed mb-8">
              Dans heeft me geleerd om mezelf te accepteren, mijn lichaam te vertrouwen en me vrij te voelen 
              in beweging. Het is een reis van zelfontdekking die me elke dag inspireert om te groeien, 
              te leren en mezelf uit te dagen op nieuwe manieren.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-bold text-neon-green mb-3">Zelfvertrouwen</h3>
                <p className="text-white/70">Dans heeft mijn zelfvertrouwen enorm verbeterd en me geleerd om trots te zijn op wie ik ben.</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-bold text-neon-green mb-3">Creativiteit</h3>
                <p className="text-white/70">Het ontwikkelen van mijn eigen dansstijl heeft mijn creativiteit in alle aspecten van het leven gestimuleerd.</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-bold text-neon-green mb-3">Verbinding</h3>
                <p className="text-white/70">Dans heeft me geholpen om me te verbinden met anderen en een community te vinden van gelijkgestemde mensen.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

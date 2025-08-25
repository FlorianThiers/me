import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, Mountain, Waves, Snowflake, MountainSnow, Zap, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
export const SportsPage: React.FC = () => {

  const sports = [
    {
      icon: <MountainSnow className="w-12 h-12" />,
      title: 'Slacklining',
      description: 'Balanceren op een strakke lijn tussen twee punten. Een sport die balans, focus en mentale rust combineert.',
      details: ['Balance training', 'Mental focus', 'Core strength', 'Meditation in motion'],
      photoPlaceholder: '📸 Slackline foto',
      color: 'from-green-400 to-emerald-600'
    },
    {
      icon: <Activity className="w-12 h-12" />,
      title: 'Dagelijkse Training',
      description: 'Consistente training voor algemene fitheid en kracht. Van cardio tot krachttraining.',
      details: ['Cardio', 'Strength training', 'Flexibility', 'Consistency'],
      photoPlaceholder: '📸 Training foto',
      color: 'from-blue-400 to-cyan-600'
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: 'Dapo Flow Star',
      description: 'Een unieke bewegingskunst die vloeiende bewegingen combineert met acrobatische elementen. Een mix van dans, martial arts en flow.',
      details: ['Flow movement', 'Acrobatics', 'Martial arts', 'Creative expression'],
      photoPlaceholder: '📸 Dapo Flow Star foto',
      color: 'from-purple-400 to-pink-600',
      link: '/sports/dapo-flow-star'
    },
    {
      icon: <Music className="w-12 h-12" />,
      title: 'Dancing',
      description: 'Expressieve dansvormen die ritme, emotie en beweging combineren. Van freestyle tot choreografie.',
      details: ['Freestyle', 'Choreography', 'Rhythm', 'Emotional expression'],
      photoPlaceholder: '📸 Dancing foto',
      color: 'from-rose-400 to-red-600',
      link: '/sports/dancing'
    },
    {
      icon: <Mountain className="w-12 h-12" />,
      title: 'Boulderen',
      description: 'Klimmen zonder touw op lage hoogtes. Een puzzel van beweging en kracht.',
      details: ['Problem solving', 'Upper body strength', 'Mental strategy', 'Social sport'],
      photoPlaceholder: '📸 Boulderen foto',
      color: 'from-orange-400 to-red-600'
    },
    {
      icon: <Snowflake className="w-12 h-12" />,
      title: 'Snowboarden',
      description: 'Glijden over sneeuw op een board. Vrijheid en adrenaline in de bergen.',
      details: ['Mountain freedom', 'Balance', 'Speed control', 'Winter adventure'],
      photoPlaceholder: '📸 Snowboard foto',
      color: 'from-sky-400 to-blue-600'
    },
    {
      icon: <Waves className="w-12 h-12" />,
      title: 'Surfen',
      description: 'Rijden op golven in de oceaan. Een nieuwe uitdaging die ik binnenkort ga ontdekken.',
      details: ['Ocean connection', 'Wave reading', 'Balance', 'Coming soon'],
      photoPlaceholder: '📸 Surfen foto (binnenkort)',
      color: 'from-teal-400 to-cyan-600'
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-dark-bg">
      <div className="container-custom px-4 py-8">
        
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center mb-8">
            <Link
              to="/interests"
              className="mr-4 p-2 rounded-full bg-dark-secondary/50 border border-white/10 hover:border-neon-green/50 transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Sports & Adventure
              </h1>
              <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
                Van slacklinen in het park tot snowboarden in de bergen - sport en avontuur zijn een essentieel 
                onderdeel van mijn leven. Deze activiteiten helpen me om balans te vinden tussen lichaam en geest.
              </p>
            </div>
          </div>
        </div>

        {/* Sports Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sports.map((sport, index) => (
              <motion.div
                key={sport.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-neon-green/50 transition-all duration-300 group"
              >
                {sport.link ? (
                  <Link to={sport.link} className="block">
                    {/* Photo Section */}
                    <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-white/10">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{sport.photoPlaceholder}</div>
                        <p className="text-white/60 text-sm">Foto ruimte voor {sport.title}</p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${sport.color} mr-4 group-hover:scale-110 transition-transform duration-300`}>
                          {sport.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-white">
                          {sport.title}
                        </h3>
                      </div>
                      
                      <p className="text-white/70 mb-4 leading-relaxed">
                        {sport.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {sport.details.map((detail) => (
                          <span
                            key={detail}
                            className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm font-medium border border-neon-green/30"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                      
                      {/* Link Indicator */}
                      <div className="mt-4 text-center">
                        <span className="inline-flex items-center text-neon-green text-sm font-medium group-hover:text-neon-blue transition-colors duration-300">
                          Verken {sport.title}
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <>
                    {/* Photo Section */}
                    <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-white/10">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{sport.photoPlaceholder}</div>
                        <p className="text-white/60 text-sm">Foto ruimte voor {sport.title}</p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${sport.color} mr-4 group-hover:scale-110 transition-transform duration-300`}>
                          {sport.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-white">
                          {sport.title}
                        </h3>
                      </div>
                      
                      <p className="text-white/70 mb-4 leading-relaxed">
                        {sport.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {sport.details.map((detail) => (
                          <span
                            key={detail}
                            className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm font-medium border border-neon-green/30"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Philosophy Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Waarom Sport & Avontuur?
            </h2>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed mb-8">
              Sport en avontuur zijn meer dan alleen fysieke activiteiten. Ze leren me over doorzettingsvermogen, 
              probleemoplossing, en het vinden van balans. Elke sport heeft zijn eigen uitdagingen en lessen, 
              die ik kan toepassen in mijn werk en dagelijks leven.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-bold text-neon-green mb-3">Balans & Focus</h3>
                <p className="text-white/70">Slacklinen en boulderen vereisen volledige focus en balans - vaardigheden die essentieel zijn in alle aspecten van het leven.</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-bold text-neon-green mb-3">Doorzettingsvermogen</h3>
                <p className="text-white/70">Elke sport heeft zijn uitdagingen. Het overwinnen daarvan bouwt karakter en leert me niet op te geven.</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-bold text-neon-green mb-3">Natuur & Avontuur</h3>
                <p className="text-white/70">De verbinding met natuur en het gevoel van vrijheid geven me energie en inspiratie voor creativiteit.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

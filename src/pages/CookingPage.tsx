import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Star, Clock, Users, Utensils, Flame, Leaf, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookingPage: React.FC = () => {

  const cookingCategories = [
    {
      icon: <Heart className="w-12 h-12" />,
      title: 'Gezonde Recepten',
      description: 'Voedzame en gezonde maaltijden die zowel lekker als voedzaam zijn. Focus op verse ingrediënten en gebalanceerde voeding.',
      details: ['Salades', 'Smoothies', 'Gezonde Bowls', 'Vegetarisch', 'Superfoods'],
      photoPlaceholder: '🥗',
      color: 'from-green-400 to-emerald-600',
      recipes: [
        {
          name: 'Quinoa Power Bowl',
          description: 'Een voedzame bowl met quinoa, avocado, groene groenten en tahini dressing.',
          difficulty: 'Makkelijk',
          time: '20 min',
          rating: 5,
          tags: ['Gezond', 'Vegetarisch', 'Glutenvrij']
        },
        {
          name: 'Groene Smoothie Bowl',
          description: 'Een energieke smoothie bowl met spinazie, banaan, mango en granola topping.',
          difficulty: 'Makkelijk',
          time: '10 min',
          rating: 4,
          tags: ['Ontbijt', 'Smoothie', 'Vitamines']
        }
      ]
    },
    {
      icon: <Flame className="w-12 h-12" />,
      title: 'Experimentele Gerechten',
      description: 'Creatieve en experimentele recepten waarbij ik nieuwe smaken en technieken uitprobeer. Van fusion cuisine tot moleculaire gastronomie.',
      details: ['Fusion Cuisine', 'Moleculaire Gastronomie', 'Nieuwe Technieken', 'Creatieve Combinaties', 'Innovatie'],
      photoPlaceholder: '🔥',
      color: 'from-red-400 to-orange-600',
      recipes: [
        {
          name: 'Miso Caramel Dessert',
          description: 'Een unieke combinatie van umami en zoetheid met miso, caramel en vanille.',
          difficulty: 'Gevorderd',
          time: '45 min',
          rating: 5,
          tags: ['Dessert', 'Fusion', 'Experimenteel']
        },
        {
          name: 'Sous Vide Eieren',
          description: 'Perfecte eieren gekookt op lage temperatuur voor een unieke textuur.',
          difficulty: 'Gemiddeld',
          time: '60 min',
          rating: 4,
          tags: ['Techniek', 'Ontbijt', 'Precisie']
        }
      ]
    },
    {
      icon: <Utensils className="w-12 h-12" />,
      title: 'Traditionele Recepten',
      description: 'Klassieke gerechten uit verschillende culturen, met respect voor traditionele bereidingswijzen en authentieke smaken.',
      details: ['Italiaans', 'Aziatisch', 'Mediterraan', 'Traditioneel', 'Authentiek'],
      photoPlaceholder: '🍝',
      color: 'from-yellow-400 to-orange-600',
      recipes: [
        {
          name: 'Homemade Pasta',
          description: 'Verse pasta gemaakt van scratch met een klassieke tomatensaus en basilicum.',
          difficulty: 'Gemiddeld',
          time: '90 min',
          rating: 5,
          tags: ['Italiaans', 'Pasta', 'Traditioneel']
        },
        {
          name: 'Ramen Tonkotsu',
          description: 'Een rijke, romige ramen met 12-uur gekookte varkensbouillon en perfecte noedels.',
          difficulty: 'Gevorderd',
          time: '720 min',
          rating: 5,
          tags: ['Japans', 'Ramen', 'Bouillon']
        }
      ]
    },
    {
      icon: <Leaf className="w-12 h-12" />,
      title: 'Vegetarisch & Vegan',
      description: 'Plant-based recepten die bewijzen dat vegetarisch en vegan eten niet saai hoeft te zijn. Vol smaak en creativiteit.',
      details: ['Vegan', 'Vegetarisch', 'Plant-based', 'Duurzaam', 'Ethisch'],
      photoPlaceholder: '🌱',
      color: 'from-green-400 to-teal-600',
      recipes: [
        {
          name: 'Jackfruit Pulled "Pork"',
          description: 'Vegan pulled pork gemaakt van jackfruit met BBQ saus en coleslaw.',
          difficulty: 'Gemiddeld',
          time: '30 min',
          rating: 4,
          tags: ['Vegan', 'BBQ', 'Jackfruit']
        },
        {
          name: 'Cashew Cheese Platter',
          description: 'Een assortiment van zelfgemaakte vegan kazen op basis van cashewnoten.',
          difficulty: 'Gevorderd',
          time: '120 min',
          rating: 5,
          tags: ['Vegan', 'Kaas', 'Fermentatie']
        }
      ]
    },
    {
      icon: <Star className="w-12 h-12" />,
      title: 'Speciale Gelegenheden',
      description: 'Feestelijke en bijzondere gerechten voor speciale momenten. Van verjaardagen tot feestdagen - elk moment verdient iets speciaals.',
      details: ['Feestdagen', 'Verjaardagen', 'Romantisch', 'Feestelijk', 'Speciaal'],
      photoPlaceholder: '🎉',
      color: 'from-purple-400 to-pink-600',
      recipes: [
        {
          name: 'Chocolate Lava Cake',
          description: 'Een decadente chocolade lava cake met vanille-ijs en bessen coulis.',
          difficulty: 'Gemiddeld',
          time: '25 min',
          rating: 5,
          tags: ['Dessert', 'Chocolade', 'Romantisch']
        },
        {
          name: 'Beef Wellington',
          description: 'Een klassieke Beef Wellington met champignons duxelles en bladerdeeg.',
          difficulty: 'Gevorderd',
          time: '180 min',
          rating: 5,
          tags: ['Vlees', 'Feestelijk', 'Klassiek']
        }
      ]
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: 'Snelle Maaltijden',
      description: 'Lekkere en voedzame maaltijden die in 30 minuten of minder klaar zijn. Perfect voor drukke dagen zonder in te leveren op smaak.',
      details: ['30 min of minder', 'Eenvoudig', 'Snel', 'Praktisch', 'Weeknight'],
      photoPlaceholder: '⚡',
      color: 'from-blue-400 to-cyan-600',
      recipes: [
        {
          name: 'One-Pot Pasta',
          description: 'Een complete pasta maaltijd gekookt in één pan met tomaten, spinazie en kaas.',
          difficulty: 'Makkelijk',
          time: '20 min',
          rating: 4,
          tags: ['Snel', 'One-pot', 'Pasta']
        },
        {
          name: 'Stir-fry Express',
          description: 'Een snelle wok met seizoensgroenten, tofu en een umami-rijke saus.',
          difficulty: 'Makkelijk',
          time: '15 min',
          rating: 4,
          tags: ['Wok', 'Vegetarisch', 'Snel']
        }
      ]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Makkelijk': return 'bg-green-500/20 text-green-400';
      case 'Gemiddeld': return 'bg-yellow-500/20 text-yellow-400';
      case 'Gevorderd': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
      />
    ));
  };

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
                👨‍🍳 Cooking & Culinary Arts
              </h1>
              <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
                Van snelle weeknight maaltijden tot experimentele fusion cuisine - ontdek mijn passie voor 
                koken en het creëren van heerlijke gerechten. Een mix van traditionele technieken en moderne innovatie.
              </p>
            </div>
          </div>
        </div>

        {/* Cooking Categories Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {cookingCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-neon-green/50 transition-all duration-300 group"
              >
                {/* Photo Section */}
                <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-white/10">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{category.photoPlaceholder}</div>
                    <p className="text-white/60 text-sm">Gerecht foto's voor {category.title}</p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${category.color} mr-4 group-hover:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {category.title}
                    </h3>
                  </div>
                  
                  <p className="text-white/70 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {category.details.map((detail) => (
                      <span
                        key={detail}
                        className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm font-medium border border-neon-green/30"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>

                  {/* Recipes List */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Featured Recepten:</h4>
                    {category.recipes.map((recipe, recipeIndex) => (
                      <div key={recipeIndex} className="bg-dark-bg/50 rounded-lg p-4 border border-white/5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-medium text-white mb-1">{recipe.name}</h5>
                            <p className="text-white/60 text-sm mb-2">{recipe.description}</p>
                          </div>
                          <div className="flex items-center space-x-1 ml-4">
                            {renderStars(recipe.rating)}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-white/60" />
                              <span className="text-white/70">{recipe.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4 text-white/60" />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                                {recipe.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {recipe.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Philosophy Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Mijn Kookfilosofie
            </h2>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed mb-8">
              Koken is voor mij een creatieve uitlaatklep en een manier om te experimenteren met smaken, 
              texturen en technieken. Ik geloof in het gebruik van verse, seizoensgebonden ingrediënten en 
              het respecteren van traditionele bereidingswijzen, terwijl ik ook ruimte laat voor innovatie en experiment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <div className="text-4xl mb-4">🌿</div>
                <h3 className="text-xl font-bold text-neon-green mb-3">Verse Ingrediënten</h3>
                <p className="text-white/70">Het gebruik van de beste, verse ingrediënten is de basis van elke goede maaltijd.</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-neon-green mb-3">Creativiteit & Experiment</h3>
                <p className="text-white/70">Koken is een kunstvorm waar ruimte is voor creativiteit en het uitproberen van nieuwe combinaties.</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <div className="text-4xl mb-4">❤️</div>
                <h3 className="text-xl font-bold text-neon-green mb-3">Liefde & Passie</h3>
                <p className="text-white/70">Elke maaltijd wordt bereid met liefde en aandacht voor detail - dat proef je in elke hap.</p>
              </div>
            </div>
          </div>

          {/* Cooking Techniques */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Kooktechnieken & Vaardigheden
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Flame className="w-8 h-8 text-neon-red mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Grillen & Roosteren</h3>
                <p className="text-white/70 text-sm">Perfecte searing en caramelisatie technieken</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Utensils className="w-8 h-8 text-neon-blue mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Knife Skills</h3>
                <p className="text-white/70 text-sm">Precisie snijtechnieken en veilig mesgebruik</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Leaf className="w-8 h-8 text-neon-green mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Fermentatie</h3>
                <p className="text-white/70 text-sm">Traditionele fermentatie en pickling technieken</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Zap className="w-8 h-8 text-neon-purple mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Moleculaire Gastronomie</h3>
                <p className="text-white/70 text-sm">Experimentele technieken en texturen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
